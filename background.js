function findFolder(array, string2find) {
    for (item of array) {
        if (item.name === string2find)
            return {
                ret: true,
                folder: item
            };
    }

    return {
        ret: false,
        folder: "undefined"
    };
}

browser.menus.create({
    id: "ArchiveByYear",
    title: "Archive by Year",
    contexts: ["folder_pane"],
    async onclick(info) {
        console.log("onclick--------------------");
        console.log(info.selectedFolder);
        const objMsgList = await messenger.messages.list(info.selectedFolder);

        console.log(objMsgList);

        let ArrayEmailListByYear = [];

        for await (objEmailMsg of objMsgList.messages) {
            console.log("objEmailMsg start--------------------");
            let itemYear = objEmailMsg.date.getFullYear();

            let i;
            for (i = 0; i < ArrayEmailListByYear.length; i++) {
                if (ArrayEmailListByYear[i].year === itemYear) {
                    ArrayEmailListByYear[i].arrayMsgID.push(objEmailMsg.id);
                    break;
                }
            }

            if (i === ArrayEmailListByYear.length) {
                ArrayEmailListByYear.push({
                    year: itemYear,
                    arrayMsgID: [objEmailMsg.id]
                });
            }
        }

        console.log(ArrayEmailListByYear);

        for await (it of ArrayEmailListByYear) {
            console.log("create start--------------------");
            console.log(it);
            let strNewEmailFolderName = info.selectedFolder.name + "." + it.year;
            let objectNewFolder;
            let findret = findFolder(info.selectedFolder.subFolders, strNewEmailFolderName);
            console.log(findret);
            if (findret.ret) {
                objectNewFolder = findret.folder;
            } else {
                objectNewFolder = await messenger.folders.create(
                    info.selectedFolder,
                    strNewEmailFolderName
                );
            }

            await messenger.messages.move(it.arrayMsgID, objectNewFolder);
        }
    },
});
