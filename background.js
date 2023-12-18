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
        // info:
        // Object {
        //      button: 0,
        //      editable: false,
        //      menuItemId: "ArchiveByYear",
        //      modifiers: [],
        //      pageUrl: undefined,
        //      parentMenuItemId: 9,
        //      selectedFolder: {
        //          accountId: "account2"
        //          name: "name"
        //          path: "/dir"
        //          subFolders: Array [ {…} ]},
        //      viewType: undefined}

        // all the console.log() were used to determine the variable type and content.
        // unlike strong typed C, C++, C# or java, this is bad.

        // objMsgList:
        // Object {
        //      id: null,
        //      messages: Array [
        //          0: Object {
        //              author: "author"
        //              bccList: Array []
        //              ccList: Array []
        //              date: Date Sun Jan 08 2023 09:01:27 GMT+0800 (China Standard Time)
        //              external: false
        //              flagged: false
        //              folder: Object {
        //                  accountId: "account2",
        //                  name: "name",
        //                  path: "/dir"}
        //              headerMessageId: "44802_48396_2044"
        //              headersOnly: false
        //              id: 1
        //              junk: false
        //              junkScore: 0
        //              new: false
        //              read: true
        //              recipients: Array [ "x@y.com" ]
        //              size: 20209
        //              subject: "subject"
        //              tags: Array []}
        //          length: 1]}
        objMsgList = await messenger.messages.list(info.selectedFolder);

        // ArrayEmailListByYear:
        // Object {
        //      year: itemYear,
        //      arrayMsgID: []}
        let ArrayEmailListByYear = [];

        let current_year = new Date().getFullYear()

        // get an array of email msg id and year for temporary usage
        // we can not create folder in the email message loop through
        // because the `info.selectedFolder.subFolders` was not updated
        // when new subfolders were created in this onclick callback
        do {
            for await (objEmailMsg of objMsgList.messages) {
                let itemYear = objEmailMsg.date.getFullYear();
                // filter out email less than current year
                if (current_year <= itemYear)
                    continue;

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
                // console.log(objMsgList.id);
                objMsgList = await messenger.messages.continueList(objMsgList.id);
                // console.log(objMsgList);
                // console.log(objMsgList.id);
            }
            else
                break;
        } while (0 !== objMsgList.messages.length);

        // loop through the array of email msg id and year
        // create folder if the year does not exists and
        // move email to corresponding folder
        for await (it of ArrayEmailListByYear) {
            // console.log(it);
            let strNewEmailFolderName = info.selectedFolder.name + "." + it.year;
            let objectNewFolder;
            let findret = findFolder(info.selectedFolder.subFolders, strNewEmailFolderName);
            // console.log(findret);
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
