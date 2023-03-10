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
        // all the console.log() was used to determine the variable type and content.
        // unlike strong typed C, C++, C# or java, this is bad.
        console.log("onclick--------------------");
        console.log(info.selectedFolder);
        objMsgList = await messenger.messages.list(info.selectedFolder);

        console.log(objMsgList);

        let ArrayEmailListByYear = [];
        // get an array of email msg id and year for temporary usage
        // we can not create folder in the email message loop through
        // because the `info.selectedFolder.subFolders` was not updated
        // when new subfolders were created in this onclick callback
        do {
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

            if (null !== objMsgList.id) {
                console.log(objMsgList.id);
                objMsgList = await messenger.messages.continueList(objMsgList.id);
                console.log(objMsgList);
                console.log(objMsgList.id);
            }
            else
                break;
        } while (0 !== objMsgList.messages.length);

        console.log(ArrayEmailListByYear);

        // loop through the array of email msg id and year
        // create folder if the year does not exists and
        // move email to corresponding folder
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
