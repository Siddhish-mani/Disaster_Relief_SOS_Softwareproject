# How to Start Your Backend Server

## Step 1: Make sure MySQL is running
- Open Services (search "services" in Windows)
- Find "MySQL" and make sure it's "Running"
- If not running, right-click → Start

## Step 2: Check your .env file
Make sure you have a file called `.env` in the `server` folder with:

```
PORT=4000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=disaster_sos
```

Replace `yourpassword` with your actual MySQL root password!

## Step 3: Install packages (if you haven't already)
Open PowerShell in the `server` folder and run:
```
npm install
```

## Step 4: Start the server
In PowerShell (in the `server` folder), run:
```
npm run dev
```

You should see:
- "Connected to MySQL"
- "API listening on port 4000"

## Step 5: Test it
Open your browser and go to:
```
http://localhost:4000/health
```

You should see: `{"status":"ok"}`

## Troubleshooting

**Error: "Cannot connect to MySQL"**
- Check MySQL is running (Step 1)
- Check your password in `.env` is correct

**Error: "Port 4000 already in use"**
- Change PORT=4001 in `.env` file

**Error: "Module not found"**
- Run `npm install` again












