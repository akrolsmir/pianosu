# pianosu

Rhythm game + virtual instrument. Try it out at:
https://pianosu.netlify.app/

Read more about the vision [here](https://www.notion.so/pianosu-Vision-fd80ba9457d24e66b5429c8a3c70d911)

# Setup

## Installing

1. Install [Node.js and npm](https://nodejs.org/en/)
2. Install yarn:

```
npm install --global yarn
```

3. Run these commands:

```
cd <pianosu directory>
yarn # installs all JS dependencies
```

## Developing

- `yarn dev` to spin up a local server at http://localhost:3000

## Productivity

- Use VSCode! You'll get automatic type checking/autocomplete.
- Install these VSCode extensions:

  - `Vetur` for Vue syntax highlighting
  - `Prettier` for format-on-save

    - Then open VSCode `Preferences: Open Settings (JSON)`, and add

    ```
    "editor.formatOnSave": true,
    "[html]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[vue]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    ```

    - [In-depth setup instructions](https://www.robinwieruch.de/how-to-use-prettier-vscode)
