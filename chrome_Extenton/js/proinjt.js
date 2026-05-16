// ======= CORE INJECT JS CODE STARTS =======
const isWhatsappLoaded = () =>
  document.querySelector("#pane-side") ? true : false;

const isWebpackLoaded = () =>
  "function" === typeof webpackJsonp ||
  window.webpackChunkwhatsapp_web_client ||
  window.require;



// Custom console funtions
console.logSuccess = (message) =>
  console.log(
    `%c${message}`,
    "color: lightGreen; font-weight: bold; font-size: 14px;"
  );
console.logError = (message) =>
  console.log(`%c${message}`, "color: red; font-weight: bold;");
console.logWarn = (message) =>
  console.log(`%c${message}`, "color: orange; font-weight: bold;");

// Init Store Object Function
const initStore = function (useOldMethod = true) {
  if (useOldMethod) {
    return initStoreOld();
  } else {
    return initStoreNew();
  }
};

const initStoreOld = function () {
  const inject = function () {
    return (
      (inject.mID = Math.random().toString(36).substring(7)),
      (inject.mObj = {}),
      (window.webpackChunkbuild || window.webpackChunkwhatsapp_web_client).push(
        [
          [inject.mID],
          {},
          function (i) {
            Object.keys(i.m).forEach(function (n) {
              inject.mObj[n] = i(n);
            });
          },
        ]
      ),
      {
        modules: inject.mObj,
        constructors: inject.cArr,
        findModule: function (i) {
          let obj = [];
          return (
            Object.keys(inject.mObj).forEach(function (a) {
              let element = inject.mObj[a];
              if (void 0 !== element)
                if ("string" == typeof i) {
                  if ("object" == typeof element.default)
                    for (let e in element.default) e == i && obj.push(element);
                  for (let e in element) e == i && obj.push(element);
                } else {
                  if ("function" != typeof i)
                    throw new TypeError(
                      "findModule can only find via string and function, " +
                      typeof i +
                      " was passed"
                    );
                  i(element) && obj.push(element);
                }
            }),
            obj
          );
        },
        get: function (i) {
          return inject.mObj[i];
        },
      }
    );
  };

  return new Promise((resolve, reject) => {
    try {
      if (window.require && window.importDefault) {
        // Create store by importing whatsapp collection
        const e = (e) => window.require(e);
        const i = (e) => window.importDefault(e);

        window.Store = {
          Chat: e("WAWebChatCollection")?.ChatCollection,
          Contact: e("WAWebContactCollection")?.ContactCollection,
          Label: e("WAWebLabelCollection").LabelCollection,
          Msg: e("WAWebMsgCollection")?.MsgCollection,
          MsgKey: i("WAWebMsgKey"),
          BusinessProfile: e("WAWebBusinessProfileCollection")
            ?.BusinessProfileCollection,
          GroupMetadata: i("WAWebGroupMetadataCollection"),
          TextMsgChatAction: e("WAWebSendTextMsgChatAction"),
          MediaCollection: i("WAWebAttachMediaCollection"),
          UserConstructor: i("WAWebWid"),
          EnumTypes: e("WAWebWamEnumMediaPickerOriginType"),
          MsgType: e("WAWebMsgType")?.MSG_TYPE,
          LidUtils: e("WAWebApiContact"),
          WidFactory: e("WAWebWidFactory"),
          // Media pipeline modules (whatsapp-web.js approach)
          MediaPrep: e("WAWebPrepRawMedia"),
          OpaqueData: e("WAWebMediaOpaqueData"),
          MediaObject: e("WAWebMediaStorage"),
          MediaTypes: e("WAWebMmsMediaTypes"),
          MediaUpload: { ...e("WAWebMediaMmsV4Upload"), ...e("WAWebStartMediaUploadQpl") },
          MediaDataUtils: e("WAWebMediaDataUtils"),
          BlobCache: e("WAWebMediaInMemoryBlobCache"),
          SendMessage: e("WAWebSendMsgChatAction"),
          EphemeralFields: e("WAWebGetEphemeralFieldsMsgActionsUtils"),
          User: e("WAWebUserPrefsMeUser"),
          FindChat: e("WAWebFindChatAction")
        };

        if (window.Store) {
          window.Store.InitType = "old_method_1";
        }
      } else {
        // Create store using inject function
        let mR = inject();
        window.Store = Object.assign(
          {},
          mR.findModule((e) => e.default && e.default.Chat)[0]?.default || {}
        );
        window.Store.MediaCollection = mR.findModule(
          (e) => e.default && e.default.prototype?.processAttachments
        )[0]?.default;
        window.Store.UserConstructor = mR.findModule(
          (e) =>
            e.default &&
            e.default.prototype?.isServer &&
            e.default.prototype?.isUser
        )[0]?.default;
        window.Store.TextMsgChatAction = mR.findModule("sendTextMsgToChat")[0];
        window.Store.WidFactory = mR.findModule("createWid")[0];
        window.Store.Cmd = mR.findModule("Cmd")[0]?.Cmd;
        window.Store.ChatState = mR.findModule("sendChatStateComposing")[0];
        window.Store.ContactMethods = mR.findModule("getUserid")[0];
        window.Store.ChatHelper = mR.findModule("findChat")[0];
        window.Store.FindChat = mR.findModule("findOrCreateLatestChat")[0];
        window.Store.EnumTypes = mR.findModule("MEDIA_PICKER_ORIGIN_TYPE")[0];
        window.Store.MenuClasses = mR.findModule((e) =>
          e?.default?.menu && e?.default?.item ? e.default : null
        )[0]?.default;
        // Media pipeline modules (fallback discovery)
        window.Store.MediaPrep = mR.findModule((e) => e.prepRawMedia)[0];
        window.Store.OpaqueData = mR.findModule((e) => e.createFromData)[0];
        window.Store.MediaObject = mR.findModule((e) => e.getOrCreateMediaObject)[0];
        window.Store.MediaTypes = mR.findModule((e) => e.msgToMediaType)[0];
        window.Store.SendMessage = mR.findModule((e) => e.addAndSendMsgToChat)[0];
        window.Store.MediaUpload = mR.findModule((e) => e.uploadMedia)[0];
        window.Store.MediaDataUtils = mR.findModule((e) => e.shouldUseMediaCache)[0];
        window.Store.BlobCache = mR.findModule((e) => e.InMemoryMediaBlobCache)[0];
        window.Store.EphemeralFields = mR.findModule((e) => e.getEphemeralFields)[0];
        window.Store.User = mR.findModule((e) => e.getMaybeMeLidUser && e.getMaybeMePnUser)[0];
        window.Store.MsgKey = mR.findModule((e) => e.default && e.default.toString && e.default.toString().includes('MsgKey error'))?.[0]?.default;

        if (window.Store) {
          window.Store.InitType = "old_method_2";
        }
      }

      // Extend Store functionality
      if (window.Store?.Chat?.modelClass?.prototype) {
        window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
          window.Store.TextMsgChatAction.sendTextMsgToChat(this, ...arguments);
        };
      }

      if (window.Store?.Chat && !window.Store.Chat._find) {
        window.Store.Chat._findAndParse =
          window.Store.BusinessProfile?._findAndParse;
        window.Store.Chat._find = window.Store.BusinessProfile?._find;
      }

      resolve();
    } catch (error) {
      reject("InjectJS :: initStoreOld :: Error :: " + error);
    }
  });
};

const initStoreNew = function () {
  let neededObjects = [
    {
      id: "MediaCollection",
      module: "WAWebAttachMediaCollection",
      conditions: (module) =>
        module.default &&
          module.default.prototype &&
          (module.default.prototype.processFiles !== undefined ||
            module.default.prototype.processAttachments !== undefined)
          ? module.default
          : null,
    },
    {
      id: "Archive",
      module: "WAWebSetArchiveChatAction",
      conditions: (module) => (module.setArchive ? module : null),
    },
    {
      id: "Block",
      module: "WAWebBlockContactUtils",
      conditions: (module) =>
        module.blockContact && module.unblockContact ? module : null,
    },
    {
      id: "ChatUtil",
      module: "WAWebSendClearChatAction",
      conditions: (module) => (module.sendClear ? module : null),
    },
    {
      id: "GroupInvite",
      module: "WAWebGroupInviteJob",
      conditions: (module) => (module.queryGroupInviteCode ? module : null),
    },
    {
      id: "Wap",
      module: "WAWebCreateGroupAction",
      conditions: (module) => (module.createGroup ? module : null),
    },
    {
      id: "State",
      module: "WAWebSocketModel",
      conditions: (module) => (module.STATE && module.STREAM ? module : null),
    },
    {
      id: "_Presence",
      module: "WAWebContactPresenceBridge",
      conditions: (module) =>
        module.setPresenceAvailable && module.setPresenceUnavailable
          ? module
          : null,
    },
    {
      id: "WapDelete",
      module: "WAWebChatDeleteBridge",
      conditions: (module) =>
        module.sendConversationDelete &&
          module.sendConversationDelete.length == 2
          ? module
          : null,
    },
    {
      id: "WapQuery",
      module: "WAWebQueryExistsJob",
      conditions: (module) =>
        module.queryExist
          ? module
          : module.default && module.default.queryExist
            ? module.default
            : null,
    },
    {
      id: "UserConstructor",
      module: "WAWebWid",
      conditions: (module) =>
        module.default &&
          module.default.prototype &&
          module.default.prototype.isServer &&
          module.default.prototype.isUser
          ? module.default
          : null,
    },
    {
      id: "SendTextMsgToChat",
      module: "WAWebSendTextMsgChatAction",
      resolver: (module) => module.sendTextMsgToChat,
    },
    {
      id: "ReadSeen",
      module: "WAWebUpdateUnreadChatAction",
      conditions: (module) => (module.sendSeen ? module : null),
    },
    {
      id: "sendDelete",
      module: "WAWebDeleteChatAction",
      conditions: (module) => (module.sendDelete ? module.sendDelete : null),
    },
    {
      id: "addAndSendMsgToChat",
      module: "WAWebSendMsgChatAction",
      conditions: (module) =>
        module.addAndSendMsgToChat ? module.addAndSendMsgToChat : null,
    },
    {
      id: "Catalog",
      module: "WAWebCatalogCollection",
      conditions: (module) => (module.Catalog ? module.Catalog : null),
    },
    {
      id: "MsgKey",
      module: "WAWebMsgKey",
      conditions: (module) =>
        module.default &&
          module.default.toString &&
          module.default
            .toString()
            .includes("MsgKey error: obj is null/undefined")
          ? module.default
          : null,
    },
    {
      id: "Parser",
      module: "WAWebE2EProtoUtils",
      conditions: (module) =>
        module.convertToTextWithoutSpecialEmojis ? module.default : null,
    },
    {
      id: "Builders",
      module: "WAWebProtobufsE2E.pb",
      conditions: (module) =>
        module.TemplateMessage && module.HydratedFourRowTemplate
          ? module
          : null,
    },
    {
      id: "Me",
      module: "WAWebUserPrefsMeUser",
      conditions: (module) =>
        module.PLATFORMS && module.Conn ? module.default : null,
    },
    {
      id: "MyStatus",
      module: "WAWebContactStatusBridge",
      conditions: (module) =>
        module.getStatus && module.setMyStatus ? module : null,
    },
    {
      id: "ChatStates",
      module: "WAWebChatStateBridge",
      conditions: (module) =>
        module.sendChatStatePaused &&
          module.sendChatStateRecording &&
          module.sendChatStateComposing
          ? module
          : null,
    },
    {
      id: "GroupActions",
      module: "WAWebExitGroupAction",
      conditions: (module) =>
        module.sendExitGroup && module.localExitGroup ? module : null,
    },
    {
      id: "Participants",
      module: "WAWebGroupsParticipantsApi",
      conditions: (module) =>
        module.addParticipants &&
          module.removeParticipants &&
          module.promoteParticipants &&
          module.demoteParticipants
          ? module
          : null,
    },
    {
      id: "WidFactory",
      module: "WAWebWidFactory",
      conditions: (module) =>
        module.isWidlike && module.createWid && module.createWidFromWidLike
          ? module
          : null,
    },
    {
      id: "Sticker",
      module: "WAWebStickerPackCollection",
      resolver: (m) => m.StickerPackCollection,
      conditions: (module) =>
        module.default && module.default.Sticker
          ? module.default.Sticker
          : null,
    },
    {
      id: "UploadUtils",
      module: "WAWebUploadManager",
      conditions: (module) =>
        module.default && module.default.encryptAndUpload
          ? module.default
          : null,
    },
    {
      id: "LidUtils",
      module: "WAWebApiContact",
      conditions: (module) => module.getPhoneNumber || module.lidPnCache ? module : null
    },
    {
      id: "MediaPrep",
      module: "WAWebPrepRawMedia",
      conditions: (module) => module.prepRawMedia ? module : null,
    },
    {
      id: "OpaqueData",
      module: "WAWebMediaOpaqueData",
      conditions: (module) => module.createFromData ? module : null,
    },
    {
      id: "MediaObject",
      module: "WAWebMediaStorage",
      conditions: (module) => module.getOrCreateMediaObject ? module : null,
    },
    {
      id: "MediaTypes",
      module: "WAWebMmsMediaTypes",
      conditions: (module) => module.msgToMediaType ? module : null,
    },
    {
      id: "MediaUpload",
      module: "WAWebMediaMmsV4Upload",
      conditions: (module) => module.uploadMedia ? module : null,
    },
    {
      id: "MediaStartUpload",
      module: "WAWebStartMediaUploadQpl",
      conditions: (module) => module.startMediaUploadQpl ? module : null,
    },
    {
      id: "SendMessage",
      module: "WAWebSendMsgChatAction",
      conditions: (module) => module.addAndSendMsgToChat ? module : null,
    },
    {
      id: "EphemeralFields",
      module: "WAWebGetEphemeralFieldsMsgActionsUtils",
      conditions: (module) => module.getEphemeralFields ? module : null,
    },
    {
      id: "User",
      module: "WAWebUserPrefsMeUser",
      conditions: (module) => module.getMaybeMeLidUser ? module : null,
    },
    {
      id: "MediaDataUtils",
      module: "WAWebMediaDataUtils",
      conditions: (module) => module.shouldUseMediaCache ? module : null,
    },
    {
      id: "BlobCache",
      module: "WAWebMediaInMemoryBlobCache",
      conditions: (module) => module.InMemoryMediaBlobCache ? module : null,
    },
    {
      id: "FindChat",
      module: "WAWebFindChatAction",
      conditions: (module) => module.findOrCreateLatestChat ? module : null,
    },
  ];

  return new Promise((resolve, reject) => {
    try {
      const e = (m) => require("__debug").modulesMap[m] || false;

      const shouldRequire = (m) => {
        const a = e(m);
        if (!a) return false;
        return a.dependencies != null && a.depPosition >= a.dependencies.length;
      };

      neededObjects.map((needObj) => {
        const m = needObj.module;
        if (!m) return;
        if (!e(m)) return;
        if (shouldRequire(m)) {
          let neededModule = require(m);
          needObj.foundedModule = neededModule;
        }
      });

      window.Store = {
        ...{ ...require("WAWebCollections") },
        ...(window.Store || {}),
      };

      neededObjects.forEach((needObj) => {
        if (needObj.foundedModule) {
          window.Store[needObj.id] = needObj.resolver
            ? needObj.resolver(needObj.foundedModule)
            : needObj.foundedModule;
        }
      });

      if (window.Store.Chat) {
        window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
          window.Store.SendTextMsgToChat(this, ...arguments);
        };
      }

      if (window.Store) {
        window.Store.InitType = "new_method";
      }

      resolve();
    } catch (error) {
      reject("InjectJS :: initStoreNew :: Error :: " + error);
    }
  });
};

// Init PROS Object function
const initPros = function () {
  // Initalize PROS object
  window.PROS = { lastRead: {} };

  // _serializeRawObject
  window.PROS._serializeRawObject = (e) => {
    if (e) {
      let i = {};
      e = e.toJSON ? e.toJSON() : { ...e };
      for (let n in e)
        if (
          ("statusMute" !== n) &
          ("disappearingModeDuration" !== n) &
          ("disappearingModeSettingTimestamp" !== n) &
          ("forcedBusinessUpdateFromServer" !== n) &
          ("privacyMode" !== n) &
          ("sectionHeader" !== n) &
          ("verifiedLevel" !== n)
        ) {
          if ("id" === n) {
            i[n] = { ...e[n] };
            continue;
          }
          if ("object" == typeof e[n] && !Array.isArray(e[n])) {
            i[n] = window.PROS._serializeRawObject(e[n]);
            continue;
          }
          if (Array.isArray(e[n])) {
            i[n] = e[n].map((e) =>
              "object" == typeof e ? window.PROS._serializeRawObject(e) : e
            );
            continue;
          }
          i[n] = e[n];
        }
      return i;
    }
    return {};
  };

  // _serializeContactObject
  window.PROS._serializeContactObject = (e) => {
    return e == null
      ? null
      : Object.assign(window.PROS._serializeRawObject(e), {
        formattedName: e.formattedName,
        displayName: e.displayName,
        isMe: e.isMe,
        isMyContact: e.isMyContact,
        isPSA: e.isPSA,
        isUser: e.isUser,
        isVerified: e.isVerified,
        isWAContact: e.isWAContact,
      });
  };


  // Async chat resolution — resolves phone numbers to LID-based chat models
  window.PROS.findOrCreateChat = async function (id) {
    // 0. If caller already provided a populated Active Chat Object, safely intercept and return it!
    if (id && typeof id === 'object' && id.id && id.id._serialized && typeof id.sendMessage === 'function') {
      return id;
    }

    // 1. Try synchronous lookup first (fastest path)
    const syncChat = PROS.getChat(id);
    if (syncChat) return syncChat;

    // 2. Use findOrCreateLatestChat (WhatsApp's native resolver)
    const Store = window.Store;
    if (Store.FindChat?.findOrCreateLatestChat) {
      try {
        const chatId = typeof id === 'string' ? id : id._serialized;
        const wid = Store.WidFactory.createWid(chatId);
        if (wid) {
          const result = await Store.FindChat.findOrCreateLatestChat(wid);
          // findOrCreateLatestChat returns {chat, created} wrapper
          const resolvedChat = result?.chat || result;
          if (resolvedChat) return resolvedChat;
        }
      } catch (e) {
        console.warn('[PROS] findOrCreateLatestChat failed:', e.message);
      }
    }

    // 3. Try Chat.find as fallback
    if (Store.Chat?.find) {
      try {
        const chatId = typeof id === 'string' ? id : id._serialized;
        const wid = Store.WidFactory.createWid(chatId);
        if (wid) {
          const chat = await Store.Chat.find(wid);
          if (chat) return chat;
        }
      } catch (e) {
        console.warn('[PROS] Chat.find failed:', e.message);
      }
    }

    return null;
  };

  // Send media attachment using whatsapp-web.js processMediaData approach
  // Full pipeline: OpaqueData → prepRawMedia → MediaObject → uploadMedia → addAndSendMsgToChat
  window.PROS.sendAttachment = function (
    mediaBlob,
    chatid,
    caption,
    waitTillSend
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!mediaBlob) {
          reject(new Error('mediaBlob is required'));
          return;
        }

        // Use async chat resolution to handle LID format accounts
        const chat = await PROS.findOrCreateChat(chatid);
        if (!chat) {
          reject(new Error(`Chat not found for id: ${chatid}`));
          return;
        }

        const Store = window.Store;

        // ============================================================
        // STEP 1: processMediaData (replicating whatsapp-web.js Utils.js:453-537)
        // ============================================================

        // 1a. Create OpaqueData from the file blob
        const opaqueData = await Store.OpaqueData.createFromData(mediaBlob, mediaBlob.type);

        // 1b. Determine if we should send as document
        const mimeType = (mediaBlob.type || '').toLowerCase();
        const isDocument = !mimeType.startsWith('image/') && !mimeType.startsWith('video/') && !mimeType.startsWith('audio/');

        // 1c. Run prepRawMedia — this generates thumbnails, dimensions, filehash, etc.
        const mediaPrep = Store.MediaPrep.prepRawMedia(opaqueData, { asDocument: isDocument });
        const mediaData = await mediaPrep.waitForPrep();

        // 1d. Create or get the MediaObject for storage tracking
        if (!mediaData.filehash) {
          throw new Error('media-fault: prepRawMedia returned no filehash');
        }
        const mediaObject = Store.MediaObject.getOrCreateMediaObject(mediaData.filehash);

        // 1e. Determine the media type
        const mediaType = Store.MediaTypes.msgToMediaType({
          type: mediaData.type,
          isGif: mediaData.isGif
        });

        // 1f. Ensure mediaBlob is an OpaqueData instance
        if (!(mediaData.mediaBlob instanceof Store.OpaqueData)) {
          mediaData.mediaBlob = await Store.OpaqueData.createFromData(
            mediaData.mediaBlob,
            mediaData.mediaBlob.type
          );
        }

        // 1g. Set renderable URL and consolidate storage
        mediaData.renderableUrl = mediaData.mediaBlob.url();
        mediaObject.consolidate(mediaData.toJSON());

        // 1h. Autorelease and cache
        mediaData.mediaBlob.autorelease();

        if (Store.MediaDataUtils?.shouldUseMediaCache) {
          try {
            const shouldCache = Store.MediaDataUtils.shouldUseMediaCache(
              Store.MediaTypes.castToV4 ? Store.MediaTypes.castToV4(mediaObject.type) : mediaObject.type
            );
            if (shouldCache && mediaData.mediaBlob instanceof Store.OpaqueData) {
              const formData = mediaData.mediaBlob.formData();
              Store.BlobCache.InMemoryMediaBlobCache.put(mediaObject.filehash, formData);
            }
          } catch (cacheErr) {
            console.warn('Media cache step skipped:', cacheErr);
          }
        }

        // 1i. Upload the media
        const uploadedMedia = await Store.MediaUpload.uploadMedia({
          mimetype: mediaData.mimetype,
          mediaObject,
          mediaType
        });

        const mediaEntry = uploadedMedia.mediaEntry;
        if (!mediaEntry) {
          throw new Error('upload failed: media entry was not created');
        }

        // 1j. Set upload results on mediaData
        mediaData.set({
          clientUrl: mediaEntry.mmsUrl,
          deprecatedMms3Url: mediaEntry.deprecatedMms3Url,
          directPath: mediaEntry.directPath,
          mediaKey: mediaEntry.mediaKey,
          mediaKeyTimestamp: mediaEntry.mediaKeyTimestamp,
          filehash: mediaObject.filehash,
          encFilehash: mediaEntry.encFilehash,
          uploadhash: mediaEntry.uploadHash,
          size: mediaObject.size,
          streamingSidecar: mediaEntry.sidecar,
          firstFrameSidecar: mediaEntry.firstFrameSidecar,
        });

        // ============================================================
        // STEP 2: Build message and send (replicating whatsapp-web.js Utils.js:243-368)
        // ============================================================

        // 2a. Build media options from mediaData
        const mediaOptions = {
          ...(mediaData.toJSON ? mediaData.toJSON() : mediaData),
        };
        if (caption && /\S/.test(caption)) {
          mediaOptions.caption = caption;
          mediaOptions.isCaptionByUser = true;
        }

        // 2b. Build message key
        // Native MsgKey format: {fromMe: true, remote: Wid, id: string}
        const newId = await Store.MsgKey.newId();
        const msgKeyParams = {
          fromMe: true,
          remote: chat.id,
          id: newId,
        };

        // For group messages, add participant (the sender's WID)
        if (typeof chat.id?.isGroup === 'function' && chat.id.isGroup()) {
          const meUser = Store.User?.getMaybeMePnUser?.() || Store.User?.getMeUser?.();
          const lidUser = Store.User?.getMaybeMeLidUser?.();
          const from = (chat.groupMetadata?.isLidAddressingMode && lidUser) ? lidUser : meUser;
          msgKeyParams.participant = from;
        }

        const newMsgKey = new Store.MsgKey(msgKeyParams);

        // 2c. Get ephemeral fields if available
        let ephemeralFields = {};
        if (Store.EphemeralFields?.getEphemeralFields) {
          try {
            ephemeralFields = Store.EphemeralFields.getEphemeralFields(chat);
          } catch (e) { }
        }

        // 2d. Construct the full message
        // Need from/to for internal checks like isMetaAiBot which calls .equals()
        const meUser = Store.User?.getMaybeMePnUser?.() || Store.User?.getMeUser?.();
        const lidUser = Store.User?.getMaybeMeLidUser?.();
        const fromWid = (chat.id?.server === 'lid' && lidUser) ? lidUser : meUser;

        const message = {
          id: newMsgKey,
          ack: 0,
          body: mediaOptions.preview || '',
          from: fromWid,
          to: chat.id,
          local: true,
          self: 'out',
          t: parseInt(new Date().getTime() / 1000),
          isNewMsg: true,
          type: 'chat',
          ...ephemeralFields,
          ...mediaOptions,
        };

        // 2e. Send message using addAndSendMsgToChat
        // Native pattern: addAndSendMsgToChat(chat, Promise, callbackFn)
        // Interceptor confirmed: msg arg is Promise {<pending>}, remaining args count: 1
        const sendFn = Store.SendMessage?.addAndSendMsgToChat || Store.addAndSendMsgToChat;
        if (!sendFn) {
          throw new Error('addAndSendMsgToChat not found in Store');
        }

        const [msgPromise] = sendFn(chat, message);
        await msgPromise;

        // Optionally wait for message to appear in DOM
        if (waitTillSend) {
          const startTime = Date.now();
          const checkSent = () => {
            const sentMessages = document.querySelectorAll('.message-out');
            const lastMessage = sentMessages[sentMessages.length - 1];
            if (lastMessage) {
              resolve();
              return;
            }
            if (Date.now() - startTime > 3000) {
              resolve();
              return;
            }
            setTimeout(checkSent, 250);
          };
          checkSent();
        } else {
          resolve();
        }
      } catch (err) {
        console.error('sendAttachment error:', err);
        reject(err);
      }
    });
  };

  // Get my contacts
  window.PROS.getMyContacts = function (callback) {
    const contacts = window.Store.Contact.filter(
      (contact) => contact.isAddressBookContact === 1
    ).map((contact) => PROS._serializeContactObject(contact));

    if (callback) callback(contacts);
    return contacts;
  };

  // Get unsaved contacts
  window.PROS.getMyUnsavedContacts = function (callback) {
    const unsavedContacts = window.Store.Contact.filter(
      (contact) =>
        contact &&
        contact?.id?.server === "c.us" &&
        contact?.isAddressBookContact === 0 &&
        contact?.isBusiness !== true
    ).map((contact) => ({
      user: contact?.id?.user,
      pushname: contact?.pushname || "Unknown",
    }));
    if (callback) callback(unsavedContacts);
    return unsavedContacts;
  };

  // Get all contacts
  window.PROS.getAllContacts = function (done) {
    const contacts = window.Store.Contact.filter((contact) => {
      const isCusServer = contact?.id.server === "c.us";
      const isNotInAddressBook = contact?.isAddressBookContact === 1;
      const isNotBusiness = contact?.isBusiness !== true;
      return isCusServer && isNotInAddressBook && isNotBusiness;
    });

    if (done !== undefined) done(contacts);
    return contacts;
  };


  // Get favorite contacts
  window.PROS.getFavoriteContacts = function () {
    return window.Store.Contact.filter(contact => window.PROS._isContact(contact, 1) && contact.isFavorite).map(contact => window.PROS._serializeContact(contact));
  }


  window.PROS.getAllSavedContacts = function () {
    const savedContacts = window.Store.Contact.filter(
      (contact) =>
        contact &&
        contact?.id?.server === "c.us" &&
        contact?.isAddressBookContact === 1 &&
        contact?.isBusiness !== true
    ).map((contact) => ({
      user: contact?.id?.user,

      pushname: contact?.name || contact?.pushname || contact?.formattedTitle || "Unknown",
    }));
    return savedContacts;
  };

  // Get group contacts
  window.PROS.getGroupContacts = function (group_id, callback) {
    const group = window.PROS.getGroupById(group_id);
    if (!group || !group.groupMetadata) return {
      participants: [],
      pastParticipants: []
    };

    const {
      participants = [], pastParticipants = [], groupType
    } = group.groupMetadata;
    const _isGroup = groupType === "DEFAULT" || groupType === "LINKED_SUBGROUP";

    if (_isGroup) {
      return {
        participants: participants.map(p => window.PROS._serializeGroupContact(p.contact)),
        pastParticipants: pastParticipants.map(p => window.PROS._serializeGroupContact(p.contact))
      };
    }

    return {
      participants: participants.map(p => window.PROS._serializeGroupContact(p.contact)),
      pastParticipants: pastParticipants.map(p => window.PROS._serializeGroupContact(p.contact))
    };
  };

  window.PROS._isGroup = function (obj) {
    if (obj) {
      return obj.id?.server === 'g.us' || obj.groupMetadata;
    }
    return false;
  }

  window.PROS._serializeGroup = function (obj) {
    if (obj) {
      return {
        id: obj.id,
        name: obj.name || obj.formattedTitle || 'Unkown',
        attributes: obj.attributes,
        groupMetadata: obj.groupMetadata
      }
    }
    return {};
  }


  // Get all groups
  window.PROS.getAllGroups = function () {
    return window.Store.Chat
      .filter(chat => window.PROS._isGroup(chat))
      .map(chat => window.PROS._serializeGroup(chat));
  };

  // get all favorite groups
  window.PROS.getFavoriteGroups = function () {
    return window.Store.Chat.filter(chat => window.PROS._isGroup(chat) && chat.isFavorite).map(chat => window.PROS._serializeGroup(chat));
  }

  // Get group by id
  window.PROS.getGroupById = function (group_id) {
    return window.PROS.getAllGroups().find(group => group.id._serialized === group_id);
  }

  // Get group contacts
  window.PROS.getGroupContacts = function (group_id, callback) {
    const group = window.PROS.getGroupById(group_id);
    if (!group || !group.groupMetadata) return {
      participants: [],
      pastParticipants: []
    };

    const {
      participants = [], pastParticipants = [], groupType
    } = group.groupMetadata;
    const _isGroup = groupType === "DEFAULT" || groupType === "LINKED_SUBGROUP";

    if (_isGroup) {
      return {
        participants: participants.map(p => window.PROS._serializeGroupContact(p.contact)),
        pastParticipants: pastParticipants.map(p => window.PROS._serializeGroupContact(p.contact))
      };
    }

    return {
      participants: participants.map(p => window.PROS._serializeGroupContact(p.contact)),
      pastParticipants: pastParticipants.map(p => window.PROS._serializeGroupContact(p.contact))
    };
  };

  window.PROS._isLabel = function (obj) {
    if (obj) {
      return obj.__x_id && obj.__x_name && obj.labelItemCollection?._models;
    }
    return false;
  };

  window.PROS._serializeLabel = function (obj) {
    if (obj) {
      let contacts = [];
      if (obj.labelItemCollection._models) {
        contacts = obj.labelItemCollection._models
          .filter(item => item.__x_parentType === "Chat")
          .map(item => {
            const parentId = item.__x_parentId;
            // Resolve LID to phone number
            return window.PROS._resolveLidToPhoneNumber(parentId);
          })
          .filter(id => id !== null); // Remove any null entries
      }

      return {
        id: obj.__x_id,
        name: obj.__x_name,
        color: obj.color || "Unknown",
        contacts: contacts
      };
    }
    return {};
  };

  window.PROS.getAllLabels = function () {
    let storeLabel = window.Store?.Label;
    let models = storeLabel?.models || storeLabel?._models;

    if (!models || !models.length) return [];

    return models
      .filter(label => window.PROS._isLabel(label))
      .map(label => window.PROS._serializeLabel(label));
  };

  // Helper for group contact serialization
  window.PROS._serializeGroupContact = function (contact = {}) {
    const number = contact.__x_phoneNumber?.user || contact.phoneNumber?.user || (contact.__x_id.server === "c.us" && contact.__x_id.user) || "Unavailable";
    const name = contact.name || contact.__x_pushname || "Unknown";
    return {
      name,
      number
    };
  }

  // Get group name
  window.PROS.getGroupName = function (group_id) {
    let group = window.PROS.getGroupById(group_id);

    return group ? group.name : 'Group';
  }

  // Get chat (group or contact) by id
  window.PROS.getChat = function (id, done) {
    id = typeof id == "string" ? id : id._serialized;
    let found = window.Store.Chat.get(id);

    // If not found, try alternative server formats
    if (!found && id) {
      if (id.includes('@c.us')) {
        // Try @lid format
        const lidId = id.replace('@c.us', '@lid');
        found = window.Store.Chat.get(lidId);
      } else if (id.includes('@lid')) {
        // Try @c.us format
        const cusId = id.replace('@lid', '@c.us');
        found = window.Store.Chat.get(cusId);
      }
    }

    if (found) {
      found.sendMessage = found.sendMessage
        ? found.sendMessage
        : function () {
          return window.Store.sendMessage.apply(this, arguments);
        };
    }

    if (done !== undefined) done(found);
    return found;
  };

  // to get the recent chats based on contact or group
  window.PROS.getRecentChats = function () {
    let recentChats = window.Store.Chat.filter((chat) => {
      if (chat.id.server !== "c.us") return false;

      const isSaved = chat.contact.isAddressBookContact;
      const isNotBusiness = !chat.contact.isBusiness;

      return isSaved && isNotBusiness;
    });
    return recentChats;
  };

  // Send a message
  window.PROS.sendMessage = function (id, message) {
    return new Promise(async (resolve, reject) => {
      try {
        var chat = await PROS.findOrCreateChat(
          typeof id === 'string' ? id : id._serialized
        );
        if (chat !== undefined && chat !== null) {
          chat.sendMessage(message);
          resolve();
        } else {
          reject("chat or group not found");
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  // Convert base64 string data to File
  window.PROS.base64toFile = function (data, fileName) {
    let arr = data.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  // Resolve LID format to phone number
  window.PROS._resolveLidToPhoneNumber = function (id) {
    if (!id) return null;

    if (id.includes('@c.us') || id.includes('@g.us')) {
      return id;
    }

    if (id.includes('@lid')) {
      try {
        // Method 1: Use native WhatsApp LidUtils.getPhoneNumber()
        if (window.Store?.LidUtils?.getPhoneNumber) {
          const wid = window.Store?.WidFactory?.createWid?.(id);
          if (wid) {
            const phoneWid = window.Store.LidUtils.getPhoneNumber(wid);
            if (phoneWid) {
              const phoneNumber = phoneWid.user || phoneWid._serialized?.split('@')[0];
              if (phoneNumber) {
                return phoneNumber + '@c.us';
              }
            }
          }
        }

        // Method 2: Check LidUtils cache directly
        if (window.Store?.LidUtils?.lidPnCache) {
          const lidUser = id.split('@')[0];
          const cache = window.Store.LidUtils.lidPnCache;
          for (const cacheMap of [cache.$1, cache.$2]) {
            if (cacheMap instanceof Map) {
              for (const [key, value] of cacheMap) {
                if (key === lidUser || key === id) {
                  const phoneNumber = value?.user || value?._serialized?.split('@')[0] || value;
                  if (phoneNumber && typeof phoneNumber === 'string') {
                    return phoneNumber + '@c.us';
                  }
                }
              }
            }
          }
        }

        // Method 3: Fallback - Look up in Chat/Contact collections
        const chat = window.Store?.Chat?.get(id);
        if (chat) {
          const contact = chat.contact || chat.__x_contact;
          if (contact) {
            const phoneNumber = contact.__x_phoneNumber?.user ||
              contact.phoneNumber?.user ||
              (contact.__x_id?.server === 'c.us' && contact.__x_id?.user) ||
              (contact.id?.server === 'c.us' && contact.id?.user);
            if (phoneNumber) {
              return phoneNumber + '@c.us';
            }
          }
          if (chat.id?.server === 'c.us' && chat.id?.user) {
            return chat.id.user + '@c.us';
          }
        }
      } catch (error) {
        console.warn('Error resolving LID:', id, error);
      }
    }

    return id;
  };
};

// InitMain :: Load Store and pros
var initStoreInterval = null;
var initStoreRetryCount = 0;
var useOldMethod = true;

const initMain = function () {
  initStoreRetryCount = 0;
  initStoreInterval = setInterval(() => {
    // Guard: if interval was cleared, don't execute
    if (!initStoreInterval) return;

    if (isWhatsappLoaded() && isWebpackLoaded()) {

      initStore(useOldMethod)
        .then(() => {
          initPros();

          // Check store and pros loaded or not
          if (window.Store && window.PROS) {
            clearInterval(initStoreInterval);
            initStoreInterval = null; // Clear reference so guard above will prevent future ticks
            handleInitMainSuccess();
          } else {
            initStoreRetryCount++;
            handleInitMainError();
          }
        })
        .catch((e) => {
          initStoreRetryCount++;
          handleInitMainError();
        })

    } else {
      handleInitMainError();
    }

    if (!useOldMethod && initStoreRetryCount == 5) {
      reloadInitMain(true);
    }
  }, 1000);
}

const reloadInitMain = function (method) {
  clearInterval(initStoreInterval);
  sessionStorage.removeItem('inject_session');
  setTimeout(() => {
    // console.logWarn(`InjectJS :: reloadInitMain :: useOldMethod = ${method}`);
    useOldMethod = method;
    initMain();
  }, 2000);
};

const handleInitMainSuccess = function () {
  const isInjectExecuted = sessionStorage.getItem('inject_session');
  if (isInjectExecuted) {
    return;
  } else {
    sessionStorage.setItem('inject_session', 'executed');
  }

  if (isWhatsappLoaded() && window.Store && window.PROS) {
    // console.logSuccess(`InjectJS :: initMain - Success :: useOldMethod = ${useOldMethod}`);
    // console.logSuccess(`InjectJS :: Init Store Type  :: ${getInitStoreType()}`);
    // console.logSuccess(`InjectJS :: Whatsapp Version :: ${getWhatsappVersion()}`);

    getAllGroups();
    getAllContacts();
    getAllLabels();
    initChatbotMessageListener();
  }
};


const initChatbotMessageListener = function () {
  try {
    if (!window.Store || !window.Store.Msg) {

      return;
    }

    const MsgCollection = window.Store.Msg;
    const listenerInitTime = Date.now();
    if (MsgCollection && typeof MsgCollection.on === 'function') {
      MsgCollection.on("add", (msg) => {
        try {

          if (msg.id && msg.id.fromMe) {
            return;
          }

          if (!msg.body || msg.body.trim().length === 0) {
            return;
          }
          const msgTime = msg.t * 1000;
          if (msgTime < listenerInitTime) {
            return;
          }

          let senderId = null;
          if (msg.id && msg.id.remote) {
            if (typeof msg.id.remote === 'object' && msg.id.remote._serialized) {
              senderId = msg.id.remote._serialized;
            } else if (typeof msg.id.remote === 'string') {
              senderId = msg.id.remote;
            }
          } else if (msg.from && msg.from._serialized) {
            senderId = msg.from._serialized;
          } else if (msg.from && typeof msg.from === 'string') {
            senderId = msg.from;
          }

          window.postMessage({
            type: "incoming_message",
            payload: {
              id: msg.id._serialized,
              body: msg.body,
              from: senderId,
              isGroupMsg: senderId?.includes("@g.us") ?? false,
              senderName: msg.senderName || "Unknown",
              timestamp: msg.t
            }
          }, "*");

        } catch (error) {
          console.error("❌ Error processing incoming message:", error);
        }
      });

    } else {
      console.log("⚠️ MsgCollection.on method not available");
    }
  } catch (error) {
    console.error("❌ Error initializing chatbot message listener:", error);
  }
};


window.addEventListener("PROS::chatbot-typing-status", async (event) => {
  try {
    const { chatId, isTyping } = event.detail;

    if (!window.Store || !window.PROS) {
      return;
    }

    const chat = window.PROS.getChat(chatId);
    if (!chat) {
      return;
    }

    try {
      chat.typing = isTyping;
      return;
    } catch (err) {
      // Continue to next method
    }

    // Try Method 2: Use Cmd API if available
    if (window.Store.Cmd && typeof window.Store.Cmd.sendChatState === 'function') {
      try {
        window.Store.Cmd.sendChatState(chat.id, isTyping ? 'typing' : 'paused');
        return;
      } catch (err) {
        // Continue to next method
      }
    }

    // Try Method 3: Use WebSocket/Socket API if available
    if (window.Store.Socket && typeof window.Store.Socket.sendChatState === 'function') {
      try {
        window.Store.Socket.sendChatState(chat.id, isTyping ? 'typing' : 'paused');
        return;
      } catch (err) {
        // Continue
      }
    }

  } catch (error) {
    // Silently fail - typing status is not critical
  }
});


window.addEventListener("PROS::chatbot-send-reply", async (event) => {
  try {
    const { chatId, message, isGroup } = event.detail;

    if (!window.PROS || !window.PROS.sendMessage) {
      return;
    }
    await window.PROS.sendMessage(chatId, message);
  } catch (error) {
    console.error("❌ Error sending chatbot reply:", error);
  }
});

const handleInitMainError = function (error = null) {
  let objName = null;
  if (!isWhatsappLoaded()) objName = "Whatsapp";
  else if (!isWebpackLoaded()) objName = "Webpack";
  else if (!window.Store) objName = "Store";
  else if (!window.PROS) objName = "PROS";

  if (error) {
    console.logError(
      `InjectJS :: initMain - Error :: useOldMethod = ${useOldMethod}`
    );
    console.error(error);
  } else if (objName) {
    console.logError(
      `InjectJS :: initMain - Error :: ${objName} is not loaded! :: useOldMethod = ${useOldMethod}`
    );
  } else {
    console.logError(
      `InjectJS :: initMain - Unkown Error :: useOldMethod = ${useOldMethod}`
    );
  }
};

// ======= CORE INJECT JS CODE ENDS HERE =======

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

// ======= Pro Sender CODE STARTS =====

// Event Listeners and Pro Sender Functions
window.addEventListener("PROS::init", function (e) {
  reloadInitMain(e.detail.useOldMethod);
});

window.addEventListener("PROS::send-attachments", async function (e) {
  const attachments = e.detail.attachments;
  const caption = e.detail.caption;
  let number = e.detail.number;
  const waitTillSend = e.detail.waitTillSend;

  let activeChatObj = null;
  if (!number) {
    const activeChat = window.Store?.Chat?.getActive?.();
    if (activeChat && activeChat.id) {
      number = activeChat.id._serialized;
      activeChatObj = activeChat;
    }
  }

  let chatId;
  if (number && number.includes('@')) {
    chatId = number; // Already has server suffix
  } else if (number) {
    chatId = number + "@c.us"; // Add @c.us to plain number
  }

  try {
    const sendPromises = attachments.map(async (file, index) => {
      const fileData = await JSON.parse(file.data);
      const fileBlob = await window.PROS.base64toFile(fileData, file.name);
      
      const targetChat = activeChatObj || chatId;
      await window.PROS.sendAttachment(
        fileBlob,
        targetChat,
        caption[index],
        waitTillSend
      );
    });

    await Promise.all(sendPromises);
    window.postMessage(
      {
        type: "send_attachments_to_number",
        payload: {
          chat_id: chatId,
          is_attachments_sent: "YES",
          comments: "",
        },
      },
      "*"
    );
  } catch (error) {
    console.error(error);
    window.postMessage(
      {
        type: "send_attachments_to_number_error",
        payload: {
          chat_id: chatId,
          error: error,
          is_attachments_sent: "NO",
          comments: "Error while sending the attachments to number",
        },
      },
      "*"
    );
  }
});

window.addEventListener("PROS::send-message", async function (e) {
  const number = e.detail.number;
  const message = e.detail.message;

  // Format chat ID properly - don't add @c.us if already has server suffix
  let chatId;
  if (number.includes('@')) {
    chatId = number; // Already has server suffix
  } else {
    chatId = number + "@c.us"; // Add @c.us to plain number
  }

  try {
    await window.PROS.sendMessage(chatId, message);
    window.postMessage(
      {
        type: "send_message_to_number",
        payload: {
          chat_id: chatId,
          is_message_sent: "YES",
          comments: "",
        },
      },
      "*"
    );
  } catch (error) {
    console.error(error);
    window.postMessage(
      {
        type: "send_message_to_number_new_error",
        payload: {
          chat_id: chatId,
          error: error,
          is_message_sent: "NO",
          comments: "Error while sending the message to number",
        },
      },
      "*"
    );
  }
});

window.addEventListener("PROS::send-message-to-group", async function (e) {
  const groupId = e.detail.group_id;
  const message = e.detail.message;
  const groupIdObj = { _serialized: e.detail.group_id };

  try {
    await window.PROS.sendMessage(groupIdObj, message);
    window.postMessage(
      {
        type: "send_message_to_group",
        payload: {
          group_id: groupId,
          is_message_sent: "YES",
          comments: "",
        },
      },
      "*"
    );
  } catch (error) {
    console.error(error);
    window.postMessage(
      {
        type: "send_message_to_group_error",
        payload: {
          chat_id: groupId,
          error: error,
          is_message_sent: "NO",
          comments: "Error while sending the message to group",
        },
      },
      "*"
    );
  }
});

window.addEventListener(
  "PROS::send-attachments-to-group",
  async function (e) {
    const attachments = e.detail.attachments;
    const caption = e.detail.caption;
    let groupId = e.detail.groupId;
    const waitTillSend = e.detail.waitTillSend;

    if (!groupId) {
      const activeChat = window.Store?.Chat?.getActive?.();
      if (activeChat && activeChat.id) {
        groupId = activeChat.id._serialized;
      }
    }

    try {
      const sendPromises = attachments.map(async (file, index) => {
        const fileData = await JSON.parse(file.data);
        const fileBlob = await window.PROS.base64toFile(fileData, file.name);
        await window.PROS.sendAttachment(
          fileBlob,
          groupId,
          caption[index],
          waitTillSend
        );
      });

      await Promise.all(sendPromises);
      window.postMessage(
        {
          type: "send_attachments_to_group",
          payload: {
            group_id: groupId,
            is_attachments_sent: "YES",
            comments: "",
          },
        },
        "*"
      );
    } catch (error) {
      console.error(error);
      window.postMessage(
        {
          type: "send_attachments_to_group_error",
          payload: {
            group_id: groupId,
            error: error,
            is_attachments_sent: "NO",
            comments: "Error while sending the attachments to group",
          },
        },
        "*"
      );
    }
  }
);

window.addEventListener("PROS::export-group", function (e) {
  // Get groupId from event, or fall back to the currently active chat
  // (WhatsApp no longer exposes group IDs in DOM data attributes)
  let groupId = e.detail.groupId;
  if (!groupId) {
    const activeChat = window.Store?.Chat?.getActive?.();
    if (activeChat && activeChat.id?.server === 'g.us') {
      groupId = activeChat.id._serialized;
    }
  }

  if (!groupId) {
    console.error('Export group: no group ID found');
    return;
  }

  try {
    let groupName = PROS.getGroupName(groupId);

    let contacts = PROS.getGroupContacts(groupId);
    let rows = [];

    contacts.participants.forEach(contact => {
      rows.push([contact.number, contact.name]);
    })
    rows.push([""]),
      rows.push(["Past Participants"]),

      contacts.pastParticipants.forEach(contact =>
        rows.push([contact.number, contact.name])
      )

    // rows.sort();
    rows.unshift(['Number', 'Name'])

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(row => row.join(",")).join("\n");
    let data = encodeURI(csvContent);
    let link = document.createElement("a");

    link.setAttribute("href", data);
    link.setAttribute("download", groupName + ".csv");
    document.body.appendChild(link);
    link.click()
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
    window.postMessage({
      type: "export_group_error",
      payload: {
        group_id: groupId,
        error: error
      }
    }, "*");
  }
});

window.addEventListener("PROS::export-unsaved-contacts", function (e) {
  let type = e.detail.type;

  try {
    let rows = [];
    let contacts = PROS.getMyUnsavedContacts();

    let numContacts = type == "Advance" ? contacts.length : 10;
    for (let i = 0; i < numContacts; i++) {
      if (contacts[i].user) {
        let correctNumber = "+" + contacts[i].user;
        let whatsappName = contacts[i].pushname || "Unknown";
        rows.push([correctNumber, whatsappName]);
      }
    }

    rows.unshift(["Numbers", "Name"]);
    if (type == "Expired") {
      for (let i = 0; i < 3; i++) rows.push([]);
      rows.push(["To download all contacts please buy Advance Premium"]);
    }

    let csvContent = rows.map((row) => row.join(",")).join("\n");
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    let link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "Advanced_All_Unsaved_Chats_Export.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    window.postMessage(
      {
        type: "export_unsaved_contacts_error",
        payload: { type: type, error: error },
      },
      "*"
    );
  }
});

window.addEventListener("PROS::export-saved-contacts", function (e) {
  let type = e.detail.type;

  try {
    let rows = [];
    let contacts = PROS.getAllSavedContacts();
    let numContacts = type == "Advance" ? contacts.length : 10;

    for (let i = 0; i < numContacts; i++) {
      if (contacts[i] && contacts[i].user) {
        let correctNumber = "+" + contacts[i].user;
        let whatsappName = contacts[i].pushname || "Unknown";
        rows.push([correctNumber, whatsappName]);
      }
    }

    rows.unshift(["Numbers", "Name"]);
    if (type == "Expired") {
      for (let i = 0; i < 3; i++) rows.push([]);
      rows.push(["To download all contacts please buy Advance Premium"]);
    }

    let csvContent = rows.map((row) => row.join(",")).join("\n");
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    let link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "Advanced_All_Saved_Contacts_Export.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("❌ Error exporting saved contacts:", error);
    window.postMessage(
      {
        type: "export_saved_contacts_error",
        payload: { type: type, error: error },
      },
      "*"
    );
  }
});

const getAllGroups = async function () {
  try {
    let groups = await PROS.getAllGroups();
    if (!Array.isArray(groups)) groups = [];

    let allGroups = groups
      .filter((group) => group && (group?.id || group?.attributes?.id))
      .map((group) => ({
        id: group?.id || group?.attributes?.id,
        name: group?.formattedTitle || group?.attributes?.formattedTitle,
      }));

    window.postMessage({ type: "get_all_groups", payload: allGroups }, "*");
    return allGroups;
  } catch (error) {
    window.postMessage(
      { type: "get_all_groups_error", payload: { error: error } },
      "*"
    );
    return [];
  }
};

window.addEventListener("PROS::get-all-groups", getAllGroups);

const getAllContacts = async function () {
  try {
    let recentContacts = await PROS.getRecentChats();
    let contacts = await PROS.getAllContacts();

    const recentContactIds = new Set(
      recentContacts.map((contact) => contact.id._serialized)
    );
    const remainingContacts = contacts.filter(
      (contact) => !recentContactIds.has(contact.id._serialized)
    );
    remainingContacts.sort((a, b) => {
      const nameA = a.name || a.formattedTitle || "";
      const nameB = b.name || b.formattedTitle || "";
      return nameA.localeCompare(nameB);
    });

    const uniqueContactIds = new Set();
    const combinedContacts = [...recentContacts, ...remainingContacts].filter(
      (contact) => {
        if (uniqueContactIds.has(contact.id._serialized)) {
          return false;
        }
        uniqueContactIds.add(contact.id._serialized);
        return true;
      }
    );

    const allContacts = combinedContacts.map((contact) => ({
      id: contact.id,
      name: contact.name || contact.formattedTitle,
    }));

    window.postMessage({ type: "get_all_contacts", payload: allContacts }, "*");
    return allContacts;
  } catch (error) {
    window.postMessage(
      { type: "get_all_contacts_error", payload: { error: error } },
      "*"
    );
    return [];
  }
};

window.addEventListener("PROS::get-all-contacts", getAllContacts);

const getAllLabels = function () {
  try {
    if (!window.PROS) {
      console.warn("PROS not fully loaded");
    }

    let allLabels = window.PROS.getAllLabels();

    window.postMessage({
      type: "get_all_labels",
      payload: allLabels
    }, "*");

    return allLabels;
  } catch (error) {
    window.postMessage({
      type: "get_all_labels_error",
      payload: {
        error: error
      }
    }, "*");
    return [];
  }
};

window.addEventListener('PROS::get-all-labels', getAllLabels);

const getAllLists = function () {
  try {
    if (!window.PROS) {
      console.warn("PROS not fully loaded");
    }

    const favoriteContacts = window.PROS.getFavoriteContacts();

    const favoriteGroups = window.PROS.getFavoriteGroups().map(group => ({
      id: group.id,
      name: group.name,
    }));

    const allLists = [...favoriteContacts, ...favoriteGroups];

    try {
      const serializableLists = JSON.parse(JSON.stringify(allLists));
      window.postMessage({
        type: "get_all_lists",
        payload: serializableLists
      }, "*");
    } catch (postMessageError) {
      console.error("Failed to postMessage:", postMessageError);
      window.postMessage({
        type: "get_all_lists_error",
        payload: {
          error: postMessageError.message
        }
      }, "*");
    }

    return allLists;

  } catch (error) {
    window.postMessage({
      type: "get_all_lists_error",
      payload: {
        error: error.message
      }
    }, "*");
    return [];
  }
};

window.addEventListener('PROS::get-all-lists', getAllLists);

const getInitStoreType = function () {
  let InitType = window?.Store?.InitType;
  window.postMessage({ type: "get_init_store_type", payload: InitType }, "*");
  return InitType;
};

const getWhatsappVersion = function () {
  let whatsappVersion = window?.Debug?.VERSION
    ? window.Debug.VERSION
    : "Not Found";
  window.postMessage(
    { type: "get_whatsapp_version", payload: whatsappVersion },
    "*"
  );
  return whatsappVersion;
};

// LID Resolution Event Listener for cross-context communication
document.addEventListener('PROS::resolve-lid', function (event) {
  const { lid, callbackId } = event.detail || {};
  if (!lid || !callbackId) return;

  try {
    const resolvedNumber = window.PROS?._resolveLidToPhoneNumber?.(lid) || lid;
    document.dispatchEvent(new CustomEvent('PROS::lid-resolved', {
      detail: { callbackId, resolvedNumber }
    }));
  } catch (error) {
    document.dispatchEvent(new CustomEvent('PROS::lid-resolved', {
      detail: { callbackId, resolvedNumber: lid }
    }));
  }
});

// Start Init Main
reloadInitMain(true);
