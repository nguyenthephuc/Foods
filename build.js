var electronInstaller = require('electron-winstaller');

var settings = {
    appDirectory: './release-builds/foods-win32-ia32',
    outputDirectory: './release-setup',
    description: 'Tìm ưu đãi, khuyến mãi ăn uống xung quanh bạn',
    authors: 'The Phuc',
    exe: './Foods.exe',
    title: 'Foods',
    name: 'Foods',
    iconUrl: 'http://www.iconj.com/ico/u/u/uumvut02ml.ico',
    setupIcon: './img/favicon.ico'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);

resultPromise.then(() => {
    console.log("The installers of your application were succesfully created !");
}, (e) => {
    console.log(`Well, sometimes you are not so lucky: ${e.message}`)
});