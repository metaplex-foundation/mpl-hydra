const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  UpdateProgramsVisitor,
  TransformNodesVisitor,
  UpdateAccountsVisitor,
  InstructionNode,
  TypeLeafNode,
  assertInstructionNode,
  UpdateInstructionsVisitor,
} = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = new Kinobi([path.join(idlDir, "hydra.json")]);

// Update Programs.
kinobi.update(
  new UpdateProgramsVisitor({
    hydra: { name: "mplHydra" },
  })
);

// Remove "process" prefix from instructions.
kinobi.update(
  new TransformNodesVisitor([
    {
      selector: { type: "instruction" },
      transformer: (node) => {
        assertInstructionNode(node);
        if (!node.name.startsWith("process")) return node;
        return new InstructionNode(
          { ...node.metadata, name: node.name.replace(/^process/, "") },
          node.accounts,
          node.args,
          node.subInstructions
        );
      },
    },
  ])
);

// Update Accounts.
kinobi.update(
  new UpdateAccountsVisitor({
    fanout: {
      size: 300,
      seeds: [
        { kind: "literal", value: "fanout-config" },
        {
          kind: "variable",
          name: "name",
          description: "The name of the fanout account",
          type: new TypeLeafNode({ kind: "variableString" }),
        },
      ],
    },
    fanoutMembershipVoucher: {
      size: 153,
      seeds: [
        { kind: "literal", value: "fanout-membership" },
        {
          kind: "variable",
          name: "fanout",
          description: "The address of the fanout account",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
        {
          kind: "variable",
          name: "member",
          description: "The member's public key",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
      ],
    },
    fanoutMint: {
      size: 200,
      seeds: [
        { kind: "literal", value: "fanout-config" },
        {
          kind: "variable",
          name: "fanout",
          description: "The address of the fanout account",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
        {
          kind: "variable",
          name: "mint",
          description: "The address of the mint account",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
      ],
    },
    fanoutMembershipMintVoucher: {
      size: 105,
      seeds: [
        { kind: "literal", value: "fanout-membership" },
        {
          kind: "variable",
          name: "fanout",
          description: "The address of the fanout account",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
        {
          kind: "variable",
          name: "membership",
          description: "The address of the membership account",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
        {
          kind: "variable",
          name: "mint",
          description: "The address of the mint account",
          type: new TypeLeafNode({ kind: "publicKey" }),
        },
      ],
    },
  })
);

// Update Instructions.
const holdingAccountPdaDefaults = {
  kind: "pda",
  pdaAccount: "fanoutNativeAccount",
  dependency: "rootHooked",
  seeds: { fanout: { kind: "account", name: "fanout" } },
};
kinobi.update(
  new UpdateInstructionsVisitor({
    init: {
      internal: true,
      bytesCreatedOnChain: {
        kind: "number",
        includeHeader: false,
        value:
          300 + // Fanout account.
          1 + // Holding account.
          128 * 2, // 2 account headers.
      },
      accounts: {
        fanout: { defaultsTo: { kind: "pda" } },
        holdingAccount: { defaultsTo: holdingAccountPdaDefaults },
      },
    },
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
