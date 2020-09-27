const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

//set ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//listen for app to be ready
app.on('ready', function() {
	//create new Window
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	});
	//load html file into window
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file',
			slashes: true
		})
	);

	//Quit app when closed
	mainWindow.on('closed', function() {
		app.quit();
	});
	//Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	//Insert Menu
	Menu.setApplicationMenu(mainMenu);
});

// handle create add Window
function createAddWindow() {
	//create new Window
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add Shopping List Item',
		webPreferences: {
			nodeIntegration: true
		}
	});
	//load html file into window
	addWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, 'addWindow.html'),
			protocol: 'file',
			slashes: true
		})
	);
	// Garbage Collection handle
	addWindow.on('close', function() {
		addWindow = null;
	});
}

//catch item add
ipcMain.on('item:add', function(e, item) {
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

//create menu template
const mainMenuTemplate = [
	//each object is a dropdwon
	{
		label: 'File',
		submenu: [
			{
				label: 'Add Item',
				click() {
					createAddWindow();
				}
			},
			{
				label: 'Clear Item',
				click() {
					mainWindow.webContents.send('item:clear');
				}
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				}
			}
		]
	}
];

// If OSX, add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu: [
			{
				role: 'reload'
			},
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				}
			}
		]
	});
}
