const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "hydra.json")]);

// Update Programs.
kinobi.update(
  new k.UpdateProgramsVisitor({
    hydra: { name: "mplHydra" },
  })
);

// Remove "process" prefix from instructions.
kinobi.update(
  new k.TransformNodesVisitor([
    {
      selector: { kind: "instructionNode" },
      transformer: (node) => {
        k.assertInstructionNode(node);
        if (!node.name.startsWith("process")) return node;
        const newName = node.name.replace(/^process/, "");
        return k.instructionNode({
          ...node,
          name: newName,
          dataArgs: k.instructionDataArgsNode({
            ...node.dataArgs,
            name: newName + "InstructionData",
          }),
          extraArgs: k.instructionExtraArgsNode({
            ...node.extraArgs,
            name: newName + "InstructionExtra",
          }),
        });
      },
    },
  ])
);

// Update Accounts.
kinobi.update(
  new k.UpdateAccountsVisitor({
    fanout: {
      size: 300,
      seeds: [
        k.stringConstantSeed("fanout-config"),
        k.variableSeed(
          "name",
          k.stringTypeNode({ size: k.remainderSize() }),
          "The name of the fanout account"
        ),
      ],
    },
    fanoutMembershipVoucher: {
      size: 153,
      seeds: [
        k.stringConstantSeed("fanout-membership"),
        k.publicKeySeed("fanout", "The address of the fanout account"),
        k.publicKeySeed("member", "The member's public key"),
      ],
    },
    fanoutMint: {
      size: 200,
      seeds: [
        k.stringConstantSeed("fanout-config"),
        k.publicKeySeed("fanout", "The address of the fanout account"),
        k.publicKeySeed("mint", "The address of the mint account"),
      ],
    },
    fanoutMembershipMintVoucher: {
      size: 105,
      seeds: [
        k.stringConstantSeed("fanout-membership"),
        k.publicKeySeed("fanout", "The address of the fanout account"),
        k.publicKeySeed("membership", "The address of the membership account"),
        k.publicKeySeed("mint", "The address of the mint account"),
      ],
    },
  })
);

// Update Instructions.
kinobi.update(
  new k.UpdateInstructionsVisitor({
    init: {
      bytesCreatedOnChain: k.bytesFromNumber(
        300 + // Fanout account.
          1 + // Holding account.
          128 * 2, // 2 account headers.
        false
      ),
      accounts: {
        fanout: {
          defaultsTo: k.pdaDefault("fanout"),
        },
        holdingAccount: {
          defaultsTo: k.pdaDefault("fanoutNativeAccount", {
            importFrom: "hooked",
            seeds: { fanout: k.accountDefault("fanout") },
          }),
        },
        membershipMint: {
          defaultsTo: k.publicKeyDefault(
            "So11111111111111111111111111111111111111112"
          ),
        },
      },
      args: {
        bumpSeed: {
          defaultsTo: k.accountBumpDefault("fanout"),
        },
        nativeAccountBumpSeed: {
          defaultsTo: k.accountBumpDefault("holdingAccount"),
        },
      },
    },
    addMemberWallet: {
      bytesCreatedOnChain: k.bytesFromAccount("fanoutMembershipVoucher"),
      accounts: {
        membershipAccount: {
          defaultsTo: k.pdaDefault("fanoutMembershipVoucher"),
        },
      },
    },
  })
);

// Unwrap addMemberArgs type.
kinobi.update(new k.UnwrapDefinedTypesVisitor(["addMemberArgs"]));
kinobi.update(new k.FlattenInstructionArgsStructVisitor());

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new k.RenderJavaScriptVisitor(jsDir, { prettier }));
