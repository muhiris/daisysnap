import inquirer from "inquirer";
import { execa } from "execa";
import * as fs from "fs/promises";

async function initReactProject() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      validate: function (input) {
        return /^[a-zA-Z0-9-]+$/.test(input)
          ? true
          : "Project name may only include letters, numbers, and hyphens.";
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
//   const projectPath = `./${projectName}`;
const projectPath = `${process.cwd()}/${projectName}`; // Use absolute path

  try {
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

    console.log("Tailwind CSS setup completed!");
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
    console.log(`Project initialized successfully!\n\nTo start the development server, navigate to the project folder using the following commands:\n\n  cd ${projectName}\n  npm run dev`);


  } catch (error) {
    console.error("Error initializing project:", error.message);
  }
}

initReactProject();
