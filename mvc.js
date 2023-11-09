import inquirer from "inquirer";
import fs from "fs";
import { execFile } from "child_process";
import path from "path";
import os from "os";
import readline from "readline";

console.log("Welcome to the MVC (Mokona Video converter)");
console.log(
  "Remember to use this script, please install FFMPEG and the dependencies."
);

function showLoading(message) {
  const spinner = ["|", "/", "-", "\\"];
  let i = 0;

  return setInterval(() => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${message} ${spinner[i]}`);
    i = (i + 1) % spinner.length;
  }, 100);
}


const videoExtensions = [".mp4", ".mov", ".mkv", ".webm"];

const currentDirectory = path.dirname(process.argv[1]);

let videoFiles = [];

try {

  videoFiles = fs
    .readdirSync(currentDirectory)
    .filter((file) =>
      videoExtensions.includes(path.extname(file).toLowerCase())
    );


  if (videoFiles.length === 0) {
    console.warn("No video files found in the current directory.");
    process.exit(1);
  }

  inquirer
    .prompt([
      {
        type: "list",
        name: "fileToConvert",
        message: "Which video file do you want to convert?",
        choices: videoFiles,
      },
      {
        type: "list",
        name: "outputFormat",
        message: "What format do you want to convert this to?",
        choices: ["mp4", "mov", "mkv", "webm"],
      },
      {
        type: "input",
        name: "outputName",
        message: "What should the name of the file be (without format)?",
      },
      {
        type: "input",
        name: "outputPath",
        message:
          "Where do you want to store the converted file? (Leave empty for home directory)",
        default: () => os.homedir(),
      },
    ])
    .then((answers) => {
      const fileToConvert = path.join(currentDirectory, answers.fileToConvert);
      const outputPath = answers.outputPath;
      const outputName = answers.outputName;
      const outputFormat = answers.outputFormat;

      const outputFileName = outputName
        ? `${outputName}.${outputFormat}`
        : `converted_video.${outputFormat}`;
      const fullOutputPath = path.join(outputPath, outputFileName);

      const loading = showLoading("Converting video...");

      execFile(
        "ffmpeg",
        ["-i", fileToConvert, fullOutputPath],
        (error, stdout, stderr) => {
          clearInterval(loading); 
          readline.clearLine(process.stdout, 0); 
          readline.cursorTo(process.stdout, 0); 

          if (error) {
            console.error(`Error during conversion: ${error.message}`);
            return;
          }
          console.log(
            `Conversion completed successfully. The converted video is saved at: ${fullOutputPath}`
          );
        }
      );
    });
} catch (exception) {
  console.error(`An error occurred: ${exception.message}`);
}
