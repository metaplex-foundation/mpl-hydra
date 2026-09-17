const path = require("path");
const k = require("@metaplex-foundation/kinobi");
const { toLegacyIdl } = require("./anchor-idl-compat.cjs");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi. `idls/hydra.json` is an Anchor 0.30+ IDL, which kinobi
// 1.0.0-alpha cannot parse, so it is normalised to the legacy shape first.
const kinobi = k.createFromIdls([
  toLegacyIdl(require(path.join(idlDir, "hydra.json"))),
]);

// Update programs.
kinobi.update(
  k.updateProgramsVisitor({
    hydra: { name: "mplHydra" },
  })
);

// Remove the "process" prefix from instruction names so the client exposes
// `init`, `addMemberWallet`, ... rather than `processInit`, ...
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: "[instructionNode]",
      transform: (node) => {
        k.assertIsNode(node, "instructionNode");
        if (!node.name.startsWith("process")) return node;
        return k.instructionNode({
          ...node,
          name: node.name.replace(/^process/, ""),
        });
      },
    },
  ])
);

// `FanoutMembershipMintVoucher` is a real on-chain account but Anchor 0.30+
// only emits accounts that appear in an instruction context, and this one is
// created and read through `UncheckedAccount`. Re-add it so the client keeps
// exporting its (de)serializers, its GPA builder and its PDA helper.
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: ["[programNode]", (node) => node.name === "mplHydra"],
      transform: (node) => {
        k.assertIsNode(node, "programNode");
        return k.programNode({
          ...node,
          accounts: [
            ...node.accounts,
            k.accountNode({
              name: "fanoutMembershipMintVoucher",
              idlName: "FanoutMembershipMintVoucher",
              discriminators: [k.fieldDiscriminatorNode("discriminator")],
              data: k.structTypeNode([
                k.structFieldTypeNode({
                  name: "discriminator",
                  type: k.arrayTypeNode(k.numberTypeNode("u8"), k.fixedSizeNode(8)),
                  defaultValue: k.getAnchorAccountDiscriminator(
                    "FanoutMembershipMintVoucher"
                  ),
                  defaultValueStrategy: "omitted",
                }),
                k.structFieldTypeNode({
                  name: "fanout",
                  type: k.publicKeyTypeNode(),
                }),
                k.structFieldTypeNode({
                  name: "fanoutMint",
                  type: k.publicKeyTypeNode(),
                }),
                k.structFieldTypeNode({
                  name: "lastInflow",
                  type: k.numberTypeNode("u64"),
                }),
                k.structFieldTypeNode({
                  name: "bumpSeed",
                  type: k.numberTypeNode("u8"),
                }),
                k.structFieldTypeNode({
                  name: "stakeTime",
                  type: k.numberTypeNode("i64"),
                }),
              ]),
            }),
          ],
        });
      },
    },
  ])
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    fanout: {
      size: 300,
      seeds: [
        k.constantPdaSeedNodeFromString("fanout-config"),
        k.variablePdaSeedNode(
          "name",
          k.stringTypeNode({ size: k.remainderSizeNode() }),
          "The name of the fanout account"
        ),
      ],
    },
    fanoutMembershipVoucher: {
      size: 153,
      seeds: [
        k.constantPdaSeedNodeFromString("fanout-membership"),
        k.variablePdaSeedNode(
          "fanout",
          k.publicKeyTypeNode(),
          "The address of the fanout account"
        ),
        k.variablePdaSeedNode(
          "member",
          k.publicKeyTypeNode(),
          "The member's public key"
        ),
      ],
    },
    fanoutMint: {
      size: 200,
      seeds: [
        k.constantPdaSeedNodeFromString("fanout-config"),
        k.variablePdaSeedNode(
          "fanout",
          k.publicKeyTypeNode(),
          "The address of the fanout account"
        ),
        k.variablePdaSeedNode(
          "mint",
          k.publicKeyTypeNode(),
          "The address of the mint account"
        ),
      ],
    },
    fanoutMembershipMintVoucher: {
      size: 105,
      seeds: [
        k.constantPdaSeedNodeFromString("fanout-membership"),
        k.variablePdaSeedNode(
          "fanout",
          k.publicKeyTypeNode(),
          "The address of the fanout account"
        ),
        k.variablePdaSeedNode(
          "membership",
          k.publicKeyTypeNode(),
          "The address of the membership account"
        ),
        k.variablePdaSeedNode(
          "mint",
          k.publicKeyTypeNode(),
          "The address of the mint account"
        ),
      ],
    },
  })
);

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    init: {
      accounts: {
        fanout: {
          defaultValue: k.pdaValueNode("fanout"),
        },
        holdingAccount: {
          defaultValue: k.pdaValueNode(
            k.pdaLinkNode("fanoutNativeAccount", "hooked"),
            [k.pdaSeedValueNode("fanout", k.accountValueNode("fanout"))]
          ),
        },
        membershipMint: {
          defaultValue: k.publicKeyValueNode(
            "So11111111111111111111111111111111111111112"
          ),
        },
      },
      arguments: {
        bumpSeed: {
          defaultValue: k.accountBumpValueNode("fanout"),
        },
        nativeAccountBumpSeed: {
          defaultValue: k.accountBumpValueNode("holdingAccount"),
        },
      },
    },
    addMemberWallet: {
      accounts: {
        membershipAccount: {
          defaultValue: k.pdaValueNode("fanoutMembershipVoucher"),
        },
      },
    },
  })
);

// Set the number of bytes created on chain by the account-creating
// instructions. `updateInstructionsVisitor` cannot set `byteDeltas`.
const byteDeltas = {
  // The JavaScript renderer only reads the first byte delta, so the two
  // accounts `init` creates are accounted for in a single literal, headers
  // included -- exactly what the previous `bytesFromNumber(..., false)` did.
  init: [
    k.instructionByteDeltaNode(
      k.numberValueNode(
        300 + // Fanout account.
          1 + // Holding account.
          128 * 2 // 2 account headers.
      ),
      { withHeader: false }
    ),
  ],
  addMemberWallet: [
    k.instructionByteDeltaNode(k.accountLinkNode("fanoutMembershipVoucher"), {
      withHeader: true,
    }),
  ],
};
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: ["[instructionNode]", (node) => node.name in byteDeltas],
      transform: (node) => {
        k.assertIsNode(node, "instructionNode");
        return k.instructionNode({ ...node, byteDeltas: byteDeltas[node.name] });
      },
    },
  ])
);

// Unwrap the addMemberArgs type so `shares` is a top-level instruction argument.
kinobi.update(k.unwrapDefinedTypesVisitor(["addMemberArgs"]));
kinobi.update(k.flattenInstructionDataArgumentsVisitor());

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(k.renderJavaScriptVisitor(jsDir, { prettier }));
