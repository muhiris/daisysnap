#! /usr/bin/env node

import inquirer from "inquirer";
import { execa } from "execa";
import * as fs from "fs/promises";
import ora from "ora";

const initProject = async () => {

  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter your project name:",
        validate: function (input) {
          const isValid = /^[^\\/:\*\?"<>\|]+$/i.test(input);
          return isValid ? true : "Invalid characters in project name. Please avoid \\ / : * ? \" < > |";
        },
      },
      {
        type: "confirm",
        name: "useDaisyui",
        message: "Do you want to use Daisy UI?",
        default: false,
      },
    ]);

    const { projectName, useDaisyui } = answers;
    const projectPath = `${process.cwd()}/${projectName}`;

    const spinner = ora("Initializing project...").start();
    // Create Vite React project
    await execa("npm", [
      "create",
      "vite@latest",
      projectName,
      "--",
      "--template",
      "react",
    ]);

    // Change directory to the newly created project
    process.chdir(projectPath);

    // Install Tailwind CSS, PostCSS, and Autoprefixer
    await execa("npm", [
      "install",
      "-D",
      "tailwindcss",
      "postcss",
      "autoprefixer",
    ]);

    // Conditionally install Daisy UI
    if (useDaisyui) {
      await execa("npm", ["install", "daisyui@latest"]);
    }

    // Initialize Tailwind CSS
    await execa("npx", ["tailwindcss", "init", "-p"]);

    // Update tailwind.config.js
    const tailwindConfig = `
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {},
      },
      plugins: ${useDaisyui ? '[require("daisyui")]' : "[]"},
    }
    `;
    await fs.writeFile("tailwind.config.js", tailwindConfig.trim());

    // Add Tailwind directives to src/index.css
    const tailwindCSS = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    `;
    await fs.writeFile("src/index.css", tailwindCSS.trim());

    // Update src/App.jsx based on useDaisyui
    const appContent = useDaisyui
      ? `
      import React from 'react';

      function App() {
        return (
          <div className="App">
            <header className="App-header h-[100vh] flex flex-col justify-center items-center">
              <h1 className='text-2xl'>Tailwind CSS and DaisyUI Styles -  Project ${projectName}</h1>
              <button className="btn mt-4">Daisy UI Working</button>
            </header> 
          </div>
        );
      }
      
      export default App;
`
      : `
import React from 'react';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="flex flex-col items-center justify-center mt-4 p-8 bg-gray-200">
        <p className="text-2xl font-bold">Tailwind CSS Styles - Project ${projectName} </p>
        <p className="text-gray-600">This is a Tailwind CSS styled section.</p>
        </div>
      </header>
    </div>
  );
}

export default App;
`;

    await fs.writeFile("src/App.jsx", appContent.trim());

    // Run the development server
    // await execa("npm", ["run", "dev"]);
    spinner.succeed("Project initialized successfully!");
    console.log(
      `\nTo start the development server, navigate to the project folder using the following commands:\n\n  cd ${projectName}\n  npm run dev`
    );
  } catch (error) {
    spinner.fail("Error initializing project:");
    console.error(error.message);
  }
};

initProject();
