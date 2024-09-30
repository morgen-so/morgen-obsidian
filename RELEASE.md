
# Releasing `morgen-obsidian`

 1. Run `npm version x.x.x`
 2. Run `git push origin x.x.x`
 3. Go to [draft a new release](https://github.com/morgen-so/morgen-obsidian/releases/new)
 4. Select the new tag `x.x.x`
 5. Enter `x.x.x` as the release title
 6. Click 'Generate release notes', fix up notes to be legible
 7. Run `npm run build`
 8. Add binaries `main.js`, `manifest.json` and `style.css`
 9. Release the new version
