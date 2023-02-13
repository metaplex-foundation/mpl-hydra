const path = require("path");

const programDir = path.join(__dirname, "..", "programs");
function getProgram(dir, programName) {
  return path.join(programDir, dir, "target", "deploy", programName);
}
function getExternalProgram(programName) {
  return path.join(__dirname, "external-programs", programName);
}

module.exports = {
  validator: {
    commitment: "processed",
    programs: [
      {
        label: "Hydra",
        programId: "hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg",
        deployPath: getProgram("hydra", "mpl_hydra.so"),
      },
      {
        label: "Token Metadata",
        programId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        deployPath: getExternalProgram("mpl_token_metadata.so"),
      },
      {
        label: "System Extras",
        programId: "SysExL2WDyJi9aRZrXorrjHJut3JwHQ7R9bTyctbNNG",
        deployPath: getExternalProgram("mpl_system_extras.so"),
      },
      {
        label: "Token Extras",
        programId: "TokExjvjJmhKaRBShsBAsbSvEWMA1AgUNK7ps4SAc2p",
        deployPath: getExternalProgram("mpl_token_extras.so"),
      },
    ],
  },
};
