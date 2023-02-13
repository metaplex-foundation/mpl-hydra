const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  UpdateProgramsVisitor,
  TransformNodesVisitor,
  assertInstructionNode,
  InstructionNode,
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

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
