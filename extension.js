const vscode = require("vscode");

function activate(context) {
  console.log("VS Code Comment Extension is now active!");

  setDefaultCommentColor();
  let disposable = vscode.commands.registerCommand('extension.changeCommentColor', async () => {
    const colorChoice = await vscode.window.showQuickPick(
      ['Predefined Colors', 'Custom Hex Color'],
      {
        placeHolder: 'Choose a color option',
      }
    );
    if (colorChoice) {
      let color = '';

      if (colorChoice === 'Predefined Colors') {
        color = await vscode.window.showQuickPick(
          ['#FFD700 (Yellow)', '#FF5733 (Red)', '#00FF00 (Green)', '#1E90FF (Blue)', '#8A2BE2 (BlueViolet)', '#FF6347 (Tomato)', '#32CD32 (LimeGreen)', '#FF4500 (OrangeRed)', '#D2691E (Chocolate)', '#20B2AA (LightSeaGreen)', '#FF1493 (DeepPink)', '#4B0082 (Indigo)', '#FF8C00 (DarkOrange)', '#ADFF2F (GreenYellow)', '#9932CC (DarkOrchid)'],
          { placeHolder: 'Choose a color' }
        );

        if (color) {
          color = color.split(' ')[0];
        }
      } else if (colorChoice === 'Custom Hex Color') {
        color = await vscode.window.showInputBox({
          prompt: "Enter a hex color code (e.g., #FF5733 or #FFD700)",
          placeHolder: "#FFD700",
          validateInput: (input) => {
            const hexPattern = /^#[0-9A-Fa-f]{6}$/;
            return hexPattern.test(input) ? null : "Please enter a valid hex color code.";
          }
        });
      }

      if (color) {
        changeCommentColor(color);
      }
    }
  });

  context.subscriptions.push(disposable);

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("editor.tokenColorCustomizations")) {
      changeCommentColor("#FFD700");
    }
  });
}

function setDefaultCommentColor() {
  const config = vscode.workspace.getConfiguration();
  const tokenColorCustomizations = config.get("editor.tokenColorCustomizations") || {};
  const existingCommentColorRule = tokenColorCustomizations.textMateRules?.find(rule => rule.scope === 'comment');
  
  if (!existingCommentColorRule) {
    changeCommentColor("#FFD700");
  }
}

async function changeCommentColor(color) {
  const config = vscode.workspace.getConfiguration();
  const tokenColorCustomizations = config.get("editor.tokenColorCustomizations") || {};
  const existingCommentColorRule = tokenColorCustomizations.textMateRules?.find(rule => rule.scope === 'comment');

  if (!existingCommentColorRule || existingCommentColorRule.settings.foreground !== color) {
    const updatedTokenColorCustomizations = {
      ...tokenColorCustomizations,
      textMateRules: [
        ...(tokenColorCustomizations.textMateRules || []),
        {
          scope: "comment",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "comment.line",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "comment.block",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "comment.block.documentation",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "comment.line.double-slash",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "comment.block.documentation.string",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "comment.line.nested",
          settings: {
            foreground: color,
          },
        },
        {
          scope: "punctuation.definition.comment",
          settings: {
            foreground: color,
          },
        }
      ],
    };

    try {
      await config.update(
        "editor.tokenColorCustomizations",
        updatedTokenColorCustomizations,
        vscode.ConfigurationTarget.Global
      );
    } catch (error) {
      console.error("Error updating comment color:", error);
    }
  }
}

function deactivate() {
  const config = vscode.workspace.getConfiguration();
  config.update(
    "editor.tokenColorCustomizations",
    {},
    vscode.ConfigurationTarget.Global
  );
}

module.exports = {
  activate,
  deactivate,
};
