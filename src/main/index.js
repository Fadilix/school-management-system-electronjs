import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const electron = require("electron");
const log = require('electron-log');
const path = require("path");
const fs = require("fs");
const sqlite = require("sqlite3");
const fse = require("fs-extra");
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
import express from 'express';
 
let mainWindow , CourseWindow;
function createWindow() {
  if (!is.dev) {
    const exApp = express();
    exApp.use(express.static(path.join(__dirname, '../renderer/')));
    exApp.listen(5173, () => {
      log.info('Express server started on port 5173');
    });
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: true, // Changed to true to show default window frame
    autoHideMenuBar: true, // Changed to false to show menu bar
    ...(process.platform === 'linux' ? { icon: path.join(__dirname, 'path/to/icon.png') } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  log.info(`Preload script path: ${path.join(__dirname, '../preload/index.js')}`);

  // Load the appropriate URL based on the environment
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}



app.whenReady().then(() => {
  log.info("Ready")
  electronApp.setAppUserModelId('com.exampapersetter')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on("uncaughtException", (error) => {
  log.info(`Exception: ${error}`);
  if (process.platform !== "darwin") {
    app.quit();
  }
});

log.info(process.resourcesPath)

//Database Connection And Instance
const database = new sqlite.Database(
  is.dev
    ? path.join(path.join(app.getAppPath(), "resources/database.db"))
    : path.join(__dirname, "../../resources/database.db").replace("app.asar", "app.asar.unpacked"),
  (err) => {
    if (err) log.log("Database Error" + app.getAppPath());
    else log.log("Database Loaded sucessfully");
  }
);

// Function To Minimize Window
ipcMain.handle("minimize", () => {
  mainWindow.minimize();
});

// Function To Maximize Window
ipcMain.handle("maximize", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle("showDialog", async (event, args) => {
  let win = null;
  switch (args.window) {
    case "mainWindow":
      win = mainWindow;
      break;
    case "CourseWindow":
      win = CourseWindow;
      break;
    default:
      break;
  }

  return dialog.showMessageBox(win, args.options);
});

ipcMain.handle("saveFile", async (event, args) => {
  let options = {
    title: "Save files",

    defaultPath: app.getPath("downloads"),

    buttonLabel: "Save Output File",

    properties: ["openDirectory"],
  };

  let filename = await dialog.showOpenDialog(mainWindow, options);
  if (!filename.canceled) {
    var base64Data = args.replace(/^data:application\/pdf;base64,/, "");
    
    const p = path.join(filename.filePaths[0], "/exampaper")
    if (!fs.existsSync(p)){
      fs.mkdirSync(p);
    }
    fs.writeFileSync(
      path.join(p, "output.pdf"),
      base64Data,
      "base64"
    );


    fse.copySync("input", path.join(p,"input"))
      
  }
});

// Function To Close Window
ipcMain.handle("close", (event, args) => {
  switch (args) {
    case "mainWindow":
      app.quit();
      break;
    case "CourseWindow":
      mainWindow.webContents.send("reload");
      CourseWindow.close();
      break;
    default:
      break;
  }
});

//---------------------STUDENTS-----------------------------
//get all students
ipcMain.handle("get-students", (event, args) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        students.id, 
        students.surname, 
        students.name, 
        students.date_of_birth, 
        students.place_of_birth, 
        students.gender, 
        students.picture, 
        students.registration_number, 
        students.date_of_admission,
        students.discount_in_fee, 
        students.blood_group, 
        students.medical_condition,
        students.previous_school, 
        students.religion, 
        students.additional_note,
        students.parent_name, 
        students.parent_surname, 
        students.parent_mobile_number,
        classes.name AS class_name, 
        classes.capacity, 
        classes.class_fees
      FROM students
      LEFT JOIN classes ON students.class_id = classes.id
    `;

    database.all(query, (err, rows) => {
      if (err) {
        console.error("Error fetching students:", err.message);
        reject(err); 
      } else {
        resolve(rows); 
      }
    });
  });
});



// add a student
  ipcMain.handle("add-student", async (event, formData) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO students (
          surname, name, date_of_birth, place_of_birth, gender, 
          registration_number, date_of_admission, class_id, blood_group, 
          medical_condition, previous_school, religion, parent_name, 
          parent_surname, parent_mobile_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      const {
        surname, name, date_of_birth, place_of_birth, gender, 
        registration_number, date_of_admission, class_id, blood_group, 
        medical_condition, previous_school, religion, parent_name, 
        parent_surname, parent_mobile_number
      } = formData;
  
      database.run(query, [
        surname, name, date_of_birth, place_of_birth, gender, 
        registration_number, date_of_admission, class_id, blood_group, 
        medical_condition, previous_school, religion, parent_name, 
        parent_surname, parent_mobile_number
      ], function(err) {
        if (err) {
          console.error("Error inserting student:", err.message);
          reject(err); 
        } else {
          resolve({ id: this.lastID }); 
        }
      });
    });
  });


















//to get all employees
ipcMain.handle("get-employees", (event, args) => {
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM employees", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
})

//to get al teachers
ipcMain.handle("get-teachers", (event, args) => {
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM employees where employee_role = 'Teacher' ", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
})

//to get all classes
ipcMain.handle("get-classes", (event, args) => {
  return new Promise((resolve, reject) => {
    database.all("SELECT * FROM classes", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
})