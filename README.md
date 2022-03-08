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

### Dev Notes

take on me
B4, C#5, D5, E5, , F#5, G#5, A5, B5
A, S, D, F, , J, K, L, SEMICOLON

Pianosu next steps:

- Youtube link to new song pipeline?
- Scores?
- VFX on note press?
-

F#3, G#3, A3, B3, , C#4, D4, E4, F#4
A, S, D, F, , J, K, L, SEMICOLON

Pain points: updated notes, whoops, lost all the work saved
Also, wtf is up with scale? https://i.imgur.com/LfMXlfY.png
for A3, B3, C#4, D4, ,E4, F#4, G#4, A4 & A, S, D, F, , J, K, L,SEMICOLON
Oh, bad spacing
Should be able to resnap notes without having to replay erything?
Or some hidden key to insta-complete song so we can then edit
