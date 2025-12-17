# Complete Beginner's Guide: Slack + Claude Code + Hostinger VPS

This guide will help you set up Slack to control Claude Code on your Hostinger VPS from scratch.

## What You'll Need

- [ ] A computer (Windows, Mac, or Linux)
- [ ] Claude Pro or Team account
- [ ] Hostinger VPS (with IP address and login credentials)
- [ ] Slack workspace (free or paid)
- [ ] GitHub account
- [ ] About 30-45 minutes

---

## Part 1: Get Your Hostinger VPS Information

Before we start, you need these details from Hostinger:

1. **Your VPS IP Address** (looks like: 123.456.78.90)
2. **Your VPS Username** (usually: `root` or `u123456789`)
3. **Your VPS Password** (or SSH key if already set up)

### Where to Find This Info:

1. Log into your Hostinger account at hostinger.com
2. Go to **VPS** section
3. Click on your VPS
4. You'll see:
   - **IP Address** - Write this down!
   - **SSH Access** - Click to see username/password

---

## Part 2: Connect to Your VPS (First Time)

### On Windows:

**Option A: Use PowerShell (Built-in)**

1. Press `Windows Key + X`
2. Click **"Windows PowerShell"** or **"Terminal"**
3. Type this command (replace with YOUR ip and username):
   ```powershell
   ssh root@123.456.78.90
   ```
4. Type `yes` when asked about fingerprint
5. Enter your VPS password when prompted
   - Note: You won't see characters when typing password - this is normal!

**Option B: Download PuTTY (Easier for beginners)**

1. Download PuTTY: https://www.putty.org/
2. Install and open PuTTY
3. In **"Host Name"** field: Enter your VPS IP address
4. Click **"Open"**
5. Login with your username and password

### On Mac:

1. Press `Command + Space`
2. Type **"Terminal"** and press Enter
3. Type this command (replace with YOUR details):
   ```bash
   ssh root@123.456.78.90
   ```
4. Type `yes` when asked about fingerprint
5. Enter your VPS password

### On Linux:

1. Open Terminal (usually `Ctrl + Alt + T`)
2. Type:
   ```bash
   ssh root@123.456.78.90
   ```
3. Type `yes` when asked
4. Enter password

**✅ Success Check:** You should see a command prompt that looks like:
```
root@vps-123456:~#
```

---

## Part 3: Install Claude Code on Your VPS

You're now inside your VPS! Let's install Claude.

### Step 1: Run the Installation Command

Copy and paste this command:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Press **Enter** and wait (takes 1-2 minutes).

### Step 2: Add Claude to Your PATH

Copy and paste these commands one at a time:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.profile
```
```bash
source ~/.profile
```

### Step 3: Verify Installation

Type:
```bash
claude --version
```

**✅ Success Check:** You should see a version number like `claude 1.0.0`

### Step 4: Login to Claude

Type:
```bash
claude /login
```

You'll see a URL like: `https://claude.ai/cli/login?token=abc123...`

1. **Copy this entire URL**
2. **Open it in your desktop browser**
3. **Login to your Claude account**
4. **Authorize the CLI**

**✅ Success Check:** Terminal says "Successfully authenticated!"

### Step 5: Test Claude on VPS

Type:
```bash
claude "Say hello and tell me you're working on my VPS"
```

**✅ Success Check:** Claude responds with a greeting!

---

## Part 4: Set Up SSH Keys (So You Don't Need Password Every Time)

Now we'll set up secure key-based login. Do this on **your desktop** (not VPS).

### On Windows PowerShell/Terminal:

1. **Exit your VPS first** (type `exit` and press Enter)
2. You're back on your desktop now
3. Create SSH keys:
   ```powershell
   ssh-keygen -t ed25519 -f ~/.ssh/hostinger_vps -C "claude-vps"
   ```
4. Press **Enter** three times (no passphrase for simplicity)
5. Copy key to VPS:
   ```powershell
   type ~/.ssh/hostinger_vps.pub | ssh root@123.456.78.90 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
   ```
6. Enter your VPS password one last time

### On Mac/Linux:

1. **Exit your VPS** (type `exit`)
2. Create SSH keys:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/hostinger_vps -C "claude-vps"
   ```
3. Press **Enter** three times
4. Copy key to VPS:
   ```bash
   ssh-copy-id -i ~/.ssh/hostinger_vps root@123.456.78.90
   ```
5. Enter your VPS password one last time

### Test Passwordless Login:

```bash
ssh -i ~/.ssh/hostinger_vps root@123.456.78.90
```

**✅ Success Check:** You login WITHOUT typing a password!

Type `exit` to leave VPS.

---

## Part 5: Install Claude Code on Your Desktop

### On Windows:

Open PowerShell and run:
```powershell
irm https://claude.ai/install.ps1 | iex
```

### On Mac:

Open Terminal and run:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Add to PATH:
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### On Linux:

```bash
curl -fsSL https://claude.ai/install.sh | bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Login to Claude (Desktop):

```bash
claude /login
```

Open the URL in browser and authenticate.

**✅ Success Check:** `claude --version` works on your desktop

---

## Part 6: Connect Desktop Claude to Your VPS (SSH MCP)

This is the magic that lets Claude control your VPS!

### Install Node.js (if you don't have it):

**Windows:** Download from https://nodejs.org/ (choose LTS version)

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify: `node --version` (should show v18 or higher)

### Add SSH MCP Server to Claude:

**Replace these values with YOUR info:**
- `YOUR_VPS_IP` → Your actual Hostinger IP
- `root` → Your VPS username (if different)

**On Windows PowerShell:**
```powershell
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=YOUR_VPS_IP --user=root --key=$HOME\.ssh\hostinger_vps
```

**On Mac/Linux:**
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=YOUR_VPS_IP --user=root --key=~/.ssh/hostinger_vps
```

**Example (Mac/Linux):**
```bash
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=123.456.78.90 --user=root --key=~/.ssh/hostinger_vps
```

**✅ Success Check:** You see "MCP server added successfully"

### Test the Connection:

Start Claude in interactive mode:
```bash
claude
```

Then ask:
```
Can you run 'ls -la' on my remote server?
```

**✅ Success Check:** Claude lists files from your VPS!

Type `/exit` to quit Claude.

---

## Part 7: Set Up Slack Integration

### Step 1: Install Claude App in Slack

1. Open your Slack workspace
2. Click on **"Apps"** in the left sidebar
3. Click **"Add apps"** or search **"App Directory"**
4. Search for **"Claude"**
5. Click **"Add to Slack"** or **"Install"**
   - If you're not admin, click **"Request to Add"**
6. Follow the authorization prompts

### Step 2: Connect Claude Account to Slack

1. In Slack, find **"Claude"** in your Apps list
2. Click on the **"Home"** tab
3. Click **"Connect"** button
4. You'll be redirected to Claude.ai
5. Login and authorize Slack access
6. Authorize GitHub access (required for code sessions)

### Step 3: Configure Routing Mode

In the Claude app Home tab:

- Choose **"Code only"** - All @Claude mentions go to Code sessions
- Or **"Code + Chat"** - Smart routing (recommended)

### Step 4: Test Slack Integration

1. Go to any Slack channel
2. Type:
   ```
   @Claude create a simple Python hello world script
   ```
3. Claude should respond and create a Code session

**✅ Success Check:** You get a "View Session" link in Slack!

---

## Part 8: Test the Full Workflow

Now let's test everything together!

### Test 1: Simple VPS Command via Slack

In Slack:
```
@Claude can you check what's in the home directory on my server?
```

Claude should:
1. Create a Code session
2. Connect to your VPS via SSH
3. Run `ls -la ~`
4. Show results in Slack

### Test 2: Create a File on VPS via Slack

In Slack:
```
@Claude create a file called test.txt on my VPS with the text "Hello from Slack!"
```

Claude should:
1. Connect to VPS
2. Create the file
3. Confirm completion in Slack

### Test 3: Run a Command and See Output

In Slack:
```
@Claude run 'cat test.txt' on my server to verify the file was created
```

**✅ Success Check:** You see "Hello from Slack!" in the response!

---

## How to Use Daily

### From Slack:

1. Mention `@Claude` in any channel
2. Ask Claude to do something on your VPS:
   - "@Claude update all packages on my VPS"
   - "@Claude check disk space on my server"
   - "@Claude deploy my app to the VPS"
3. Get real-time updates in Slack
4. Click "View Session" to see full details

### From Desktop Terminal:

```bash
# Interactive mode
claude

# Then tell Claude to work on VPS:
"Install nginx on my remote server"
"Check the status of all running services"
"Create a backup of /var/www"
```

### From Web Browser:

1. Go to https://claude.ai/code
2. Start a session
3. Claude can still access your VPS via SSH MCP
4. Ask: "List all files in /var/www on my remote server"

---

## Troubleshooting

### "Permission denied" when SSH-ing:

```bash
chmod 600 ~/.ssh/hostinger_vps
chmod 644 ~/.ssh/hostinger_vps.pub
```

### "Command not found: claude":

Restart your terminal or run:
```bash
source ~/.profile    # Linux/Mac
```

### SSH MCP not working:

Check if Node.js is installed:
```bash
node --version
```

Re-add the MCP server:
```bash
claude mcp remove ssh-mcp
claude mcp add --transport stdio ssh-mcp -- npx -y ssh-mcp -- --host=YOUR_VPS_IP --user=root --key=~/.ssh/hostinger_vps
```

### Slack not connecting:

1. Go to claude.ai/code
2. Check Settings → Integrations
3. Disconnect and reconnect Slack
4. Re-authorize GitHub

### Can't connect to VPS:

Test basic SSH:
```bash
ssh -i ~/.ssh/hostinger_vps root@YOUR_VPS_IP
```

If that fails:
1. Check VPS is running in Hostinger panel
2. Verify IP address is correct
3. Try password login: `ssh root@YOUR_VPS_IP`

---

## Security Tips

1. **Never share your SSH private key** (~/.ssh/hostinger_vps)
2. **Keep your VPS updated:** `sudo apt update && sudo apt upgrade`
3. **Use strong passwords** for your Hostinger account
4. **Enable 2FA** on Claude and Slack accounts
5. **Regularly check** who has access to your Slack workspace

---

## Quick Reference

### Connect to VPS:
```bash
ssh -i ~/.ssh/hostinger_vps root@YOUR_VPS_IP
```

### Start Claude locally:
```bash
claude
```

### List MCP servers:
```bash
claude mcp list
```

### View Claude threads:
```bash
claude /thread list
```

### Get help:
```bash
claude /help
```

---

## Next Steps

Now that you're set up:

1. ✅ Test simple commands via Slack
2. ✅ Deploy a small project to your VPS using Claude
3. ✅ Set up automated tasks (cron jobs) via Claude
4. ✅ Monitor your VPS health through Slack
5. ✅ Invite team members to your Slack workspace

---

## Need Help?

- Claude Code Docs: https://code.claude.com/docs
- Slack: Mention @Claude in your workspace
- GitHub Issues: Report bugs at https://github.com/anthropics/claude-code/issues

---

**You're all set! 🎉**

Try asking @Claude in Slack to help with your next VPS task!
