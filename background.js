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
        console.log(info.selectedFolder);
        const page = await messenger.messages.list(info.selectedFolder);

        console.log(page);
        for await (item of page.messages) {
            let msgIDArrays = [];
            console.log("item--------------------");
            console.log(item);
            msgIDArrays.push(item.id);
            let newEmailFolderName = info.selectedFolder.name + "." + item.date.getFullYear();
            console.log(newEmailFolderName);
            let newFolderObject;
            let findret = findFolder(info.selectedFolder.subFolders, newEmailFolderName);
            console.log(findret);
            if (findret.ret) {
                newFolderObject = findret.folder;
            }
            else {
                // TODO: fix me
                // the global 'info.selectedFolder' is not updated after this call and
                // will leads to create error for folder already exists
                newFolderObject = await messenger.folders.create(
                    info.selectedFolder,
                    newEmailFolderName
                );
            }

            console.log(newFolderObject);

            console.log(msgIDArrays);
            await messenger.messages.move(msgIDArrays, newFolderObject);
        }
    },
});
