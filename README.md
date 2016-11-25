# projectaccount-tools

## First-time setup of your development environment
* Install Git tools for Windows: <https://git-for-windows.github.io/>
* Install newest LTS version of NodeJS, v6+ (includes NPM): <https://nodejs.org>
* Install Visual Studio Code (VSCode): <https://code.visualstudio.com>
* Create an account on Github (before you can push changes to the repository, your account needs to be added)
* Open the program Git Bash, navigate to the folder you would like the code to be checked out in, and run the command: `git clone https://github.com/abrahamsen/projectaccount-tools.git`
* Optional: To enable Git to remember your username/password, run the following command in Git Bash: `git config --global credential.helper wincred`
* Add a config.json in the root folder with the configuration for OAUTH and MongoDB
* Install modules - from command prompt in project folder, run `npm install` - it is easiest to do this from VSCode's integrated terminal (View -> Integrated Terminal)

---

## Developing

To run the code, use the F5 shortcut key, or run it in "Launch"-mode from the Debug tab.
You can then access the application at <http://localhost:3000>

---

## Recommended VSCode Extensions:

* EJS syntax highlighting: `QassimFarid.ejs-language-support`

---

## Used Libraries

* jQuery 3 <https://jquery.com/>
* Bootstrap 3 <http://getbootstrap.com/>
* Bootstrap-datepicker <https://github.com/uxsolutions/bootstrap-datepicker/>