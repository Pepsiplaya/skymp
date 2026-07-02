
(function installSkyrimRpCompatibilityPolyfills() {
  if (typeof Object.entries !== 'function') {
    Object.entries = function entries(object) {
      var result = [];
      for (var key in Object(object)) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          result.push([key, object[key]]);
        }
      }
      return result;
    };
  }
  if (typeof Object.values !== 'function') {
    Object.values = function values(object) {
      return Object.entries(object).map(function entryValue(entry) { return entry[1]; });
    };
  }
  if (typeof Object.fromEntries !== 'function') {
    Object.fromEntries = function fromEntries(entries) {
      var result = {};
      for (var index = 0; index < entries.length; index += 1) {
        result[entries[index][0]] = entries[index][1];
      }
      return result;
    };
  }
  if (typeof Object.getOwnPropertyDescriptors !== 'function') {
    Object.getOwnPropertyDescriptors = function getOwnPropertyDescriptors(object) {
      var result = {};
      var names = Object.getOwnPropertyNames(object);
      for (var index = 0; index < names.length; index += 1) {
        result[names[index]] = Object.getOwnPropertyDescriptor(object, names[index]);
      }
      return result;
    };
  }
  if (typeof String.prototype.replaceAll !== 'function') {
    String.prototype.replaceAll = function replaceAll(search, replacement) {
      return String(this).split(search).join(replacement);
    };
  }
})();

"use strict";
var skyrimRpClient = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // skyrim-platform-global:skyrimPlatform
  if (typeof Object.entries !== "function") {
    Object.entries = function entries(object) {
      var result = [];
      for (var key in Object(object)) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          result.push([key, object[key]]);
        }
      }
      return result;
    };
  }
  if (typeof Object.values !== "function") {
    Object.values = function values(object) {
      return Object.entries(object).map(function entryValue(entry) {
        return entry[1];
      });
    };
  }
  if (typeof Object.fromEntries !== "function") {
    Object.fromEntries = function fromEntries(entries) {
      var result = {};
      for (var index = 0; index < entries.length; index += 1) {
        result[entries[index][0]] = entries[index][1];
      }
      return result;
    };
  }
  if (typeof String.prototype.replaceAll !== "function") {
    String.prototype.replaceAll = function replaceAll(search, replacement) {
      return String(this).split(search).join(replacement);
    };
  }
  var sp = (() => {
    const runtimeRequire = typeof __require === "function" ? __require : null;
    if (runtimeRequire) {
      try {
        return runtimeRequire("skyrimPlatform");
      } catch (error) {
      }
    }
    if (typeof skyrimPlatform !== "undefined") {
      return skyrimPlatform;
    }
    if (typeof globalThis !== "undefined" && globalThis.skyrimPlatform) {
      return globalThis.skyrimPlatform;
    }
    throw new Error("[SkyrimRP] SkyrimPlatform API is unavailable; cannot start RP client");
  })();
  try {
    sp.printConsole("[SkyrimRP] client bundle loaded");
  } catch (error) {
  }
  var ActorBase = sp.ActorBase;
  var Debug = sp.Debug;
  var Game = sp.Game;
  var GlobalVariable = sp.GlobalVariable;
  var HttpClient = sp.HttpClient;
  var Input = sp.Input;
  var ObjectReference = sp.ObjectReference;
  var Ui = sp.Ui || { isMenuOpen: () => false };
  var Utility = sp.Utility || { isInMenuMode: () => false };
  var browser = sp.browser;
  var findConsoleCommand = sp.findConsoleCommand || (() => null);
  var loadGame = sp.loadGame || (() => {
    throw new Error("SkyrimPlatform loadGame is unavailable");
  });
  var mpClientPlugin = sp.mpClientPlugin;
  var on = sp.on;
  var printConsole = sp.printConsole;
  var settings = sp.settings;
  var storage = sp.storage;

  // src/rp-join-contract.js
  var defaultProtocolVersion = 1;
  var skympCustomPacketMessageType = 1;
  function assertText(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`${field} is required`);
    }
    return value.trim();
  }
  function optionalText(value, fallback = "") {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function optionalEnabled(value, fallback = true) {
    if (value === void 0 || value === null || value === "") {
      return fallback;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["false", "0", "no", "off"].includes(normalized)) {
        return false;
      }
      if (["true", "1", "yes", "on"].includes(normalized)) {
        return true;
      }
    }
    return Boolean(value);
  }
  function normalizeBackendUrl(url) {
    return assertText(url, "backendUrl").replace(/\/+$/, "");
  }
  function sleep(ms) {
    return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
  }
  function normalizePeer(player) {
    var _a, _b, _c, _d, _e, _f;
    if (!player || typeof player !== "object") {
      throw new Error("peer player payload is required");
    }
    return {
      clientId: assertText(player.clientId, "player.clientId"),
      accountId: optionalText(player.accountId),
      characterId: optionalText(player.characterId),
      displayName: optionalText(player.displayName, "Unknown Character"),
      overlayName: optionalText(player.overlayName, optionalText(player.displayName, "Unknown Character")),
      activeTitle: player.activeTitle || null,
      identityKnown: Boolean(player.identityKnown),
      position: {
        worldspace: optionalText((_a = player.position) == null ? void 0 : _a.worldspace, "unknown"),
        cell: optionalText((_b = player.position) == null ? void 0 : _b.cell, "unknown"),
        x: Number(((_c = player.position) == null ? void 0 : _c.x) || 0),
        y: Number(((_d = player.position) == null ? void 0 : _d.y) || 0),
        z: Number(((_e = player.position) == null ? void 0 : _e.z) || 0),
        rotationZ: Number(((_f = player.position) == null ? void 0 : _f.rotationZ) || 0)
      },
      speaking: Boolean(player.speaking)
    };
  }
  function optionalArray(value) {
    return Array.isArray(value) ? value : [];
  }
  function optionalObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }
  function normalizeAvailableOverview(available = {}) {
    return {
      accountStipend: optionalObject(available.accountStipend),
      jobBoard: optionalArray(available.jobBoard),
      noticeBoards: optionalArray(available.noticeBoards),
      noticeBoardPosts: optionalArray(available.noticeBoardPosts),
      guilds: optionalArray(available.guilds),
      guildRosters: optionalArray(available.guildRosters),
      guildContracts: optionalArray(available.guildContracts),
      propertyInteractions: optionalArray(available.propertyInteractions),
      rentableProperties: optionalArray(available.rentableProperties),
      purchasableProperties: optionalArray(available.purchasableProperties),
      propertySaleListings: optionalArray(available.propertySaleListings),
      storageAuctionEvents: optionalArray(available.storageAuctionEvents),
      storageAuctionLots: optionalArray(available.storageAuctionLots),
      courierBoard: optionalArray(available.courierBoard),
      businessOrders: optionalArray(available.businessOrders),
      businessListings: optionalArray(available.businessListings),
      recipes: optionalArray(available.recipes),
      resourceNodes: optionalArray(available.resourceNodes),
      taxiRoutes: optionalArray(available.taxiRoutes),
      taxiContracts: optionalArray(available.taxiContracts),
      territories: optionalArray(available.territories),
      wantedBoard: optionalArray(available.wantedBoard),
      medicalCalls: optionalArray(available.medicalCalls),
      spells: optionalArray(available.spells)
    };
  }
  function normalizeOwnerSnapshot(message, fallbackReason) {
    return {
      reason: optionalText(message.reason, fallbackReason),
      character: message.character || null,
      inventory: optionalArray(message.inventory),
      equipment: optionalArray(message.equipment),
      professions: optionalArray(message.professions),
      professionMemberships: optionalArray(message.professionMemberships),
      professionInvitations: optionalArray(message.professionInvitations),
      spells: optionalArray(message.spells),
      guildMemberships: optionalArray(message.guildMemberships),
      guildDues: optionalArray(message.guildDues),
      guildContractClaims: optionalArray(message.guildContractClaims),
      territoryOffices: optionalArray(message.territoryOffices),
      reputation: optionalArray(message.reputation),
      knownCharacters: optionalArray(message.knownCharacters),
      properties: optionalArray(message.properties),
      propertyRecoveryCases: optionalArray(message.propertyRecoveryCases),
      propertyCharges: optionalArray(message.propertyCharges),
      storageAuctionEvents: optionalArray(message.storageAuctionEvents),
      storageAuctionLots: optionalArray(message.storageAuctionLots),
      businesses: optionalArray(message.businesses),
      jobs: optionalArray(message.jobs),
      courierDeliveries: optionalArray(message.courierDeliveries),
      mailInbox: optionalArray(message.mailInbox),
      medicalCalls: optionalArray(message.medicalCalls),
      ownerState: optionalArray(message.ownerState),
      activeCuff: message.activeCuff || null,
      activeArrest: message.activeArrest || null,
      activeJailSentence: message.activeJailSentence || null,
      custody: message.custody || null,
      jailTasks: optionalArray(message.jailTasks),
      activeInjury: message.activeInjury || null,
      onboarding: message.onboarding || null,
      available: normalizeAvailableOverview(message.available),
      walletReconciliation: message.walletReconciliation || null
    };
  }
  function normalizeNpcSpawn(spawn) {
    if (!spawn || typeof spawn !== "object") {
      throw new Error("NPC spawn payload is required");
    }
    return {
      id: assertText(spawn.id, "spawn.id"),
      templateId: optionalText(spawn.templateId),
      templateCode: optionalText(spawn.templateCode),
      displayName: optionalText(spawn.displayName, "Server NPC"),
      role: optionalText(spawn.role),
      baseFormId: optionalText(spawn.baseFormId),
      aggression: optionalText(spawn.aggression),
      lootProfile: optionalText(spawn.lootProfile),
      worldspace: optionalText(spawn.worldspace, "Tamriel"),
      cell: optionalText(spawn.cell, "unknown"),
      x: Number(spawn.x || 0),
      y: Number(spawn.y || 0),
      z: Number(spawn.z || 0),
      rotationZ: Number(spawn.rotationZ || 0),
      status: optionalText(spawn.status, "active"),
      respawnSeconds: Number(spawn.respawnSeconds || 0),
      spawnedBy: optionalText(spawn.spawnedBy),
      createdAt: optionalText(spawn.createdAt),
      updatedAt: optionalText(spawn.updatedAt)
    };
  }
  function normalizeResourceNode(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!node || typeof node !== "object") {
      throw new Error("resource node payload is required");
    }
    return {
      code: assertText(node.code, "resourceNode.code"),
      worldReferenceCode: optionalText(node.worldReferenceCode),
      displayName: optionalText(node.displayName, "Resource Node"),
      resourceType: optionalText(node.resourceType),
      itemCode: optionalText(node.itemCode),
      itemDisplayName: optionalText(node.itemDisplayName),
      yieldQuantity: Number(node.yieldQuantity || 0),
      depletionSeconds: Number(node.depletionSeconds || 0),
      requiredToolCode: optionalText(node.requiredToolCode),
      enabled: optionalEnabled(node.enabled, true),
      state: optionalText(node.state, "available"),
      depletedByCharacterId: optionalText(node.depletedByCharacterId),
      depletedAt: optionalText(node.depletedAt),
      availableAt: optionalText(node.availableAt),
      createdAt: optionalText(node.createdAt),
      updatedAt: optionalText(node.updatedAt),
      reference: {
        code: optionalText((_a = node.reference) == null ? void 0 : _a.code),
        referenceType: optionalText((_b = node.reference) == null ? void 0 : _b.referenceType),
        worldspace: optionalText((_c = node.reference) == null ? void 0 : _c.worldspace, "Tamriel"),
        cell: optionalText((_d = node.reference) == null ? void 0 : _d.cell, "unknown"),
        x: Number(((_e = node.reference) == null ? void 0 : _e.x) || 0),
        y: Number(((_f = node.reference) == null ? void 0 : _f.y) || 0),
        z: Number(((_g = node.reference) == null ? void 0 : _g.z) || 0),
        rotationZ: Number(((_h = node.reference) == null ? void 0 : _h.rotationZ) || 0)
      }
    };
  }
  function normalizeCharacterSummary(character) {
    if (!character || typeof character !== "object") {
      throw new Error("character payload is required");
    }
    return {
      id: assertText(character.id, "character.id"),
      accountId: optionalText(character.accountId),
      name: assertText(character.name, "character.name"),
      wallet: Number(character.wallet || 0),
      createdAt: optionalText(character.createdAt)
    };
  }
  function normalizeCharacterSlots(payload) {
    const characters = optionalArray(payload == null ? void 0 : payload.characters).map(normalizeCharacterSummary);
    const maxCharactersPerAccount = Number.isInteger(payload == null ? void 0 : payload.maxCharactersPerAccount) ? payload.maxCharactersPerAccount : null;
    const availableSlots = Number.isInteger(payload == null ? void 0 : payload.availableSlots) ? payload.availableSlots : maxCharactersPerAccount === null ? null : Math.max(0, maxCharactersPerAccount - characters.length);
    return {
      characters,
      maxCharactersPerAccount,
      availableSlots
    };
  }
  function defaultNewCharacterName(slots) {
    const characters = optionalArray(slots == null ? void 0 : slots.characters);
    const maxCharactersPerAccount = Number.isInteger(slots == null ? void 0 : slots.maxCharactersPerAccount) ? slots.maxCharactersPerAccount : 2;
    const slotNumber = Math.min(maxCharactersPerAccount, characters.length + 1);
    return `New Character ${slotNumber}`;
  }
  function normalizeTradeItems(items) {
    const normalizedItems = optionalArray(items).map((item) => ({
      itemCode: assertText(item == null ? void 0 : item.itemCode, "item.itemCode"),
      quantity: Number((item == null ? void 0 : item.quantity) || 0)
    }));
    if (normalizedItems.length === 0) {
      throw new Error("items must contain at least one item");
    }
    for (const item of normalizedItems) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("item.quantity must be a positive integer");
      }
    }
    return normalizedItems;
  }
  function authHeaders(auth) {
    return {
      authorization: `Bearer ${auth.sessionToken}`,
      "x-account-id": auth.accountId
    };
  }
  function parseJsonResponse(response, path) {
    if (!response || typeof response.body !== "string") {
      throw new Error(`${path} returned an invalid HTTP response`);
    }
    if (response.body.trim() === "") {
      throw new Error(`${path} returned an empty body`);
    }
    return JSON.parse(response.body);
  }
  function unwrapRelayMessage(message) {
    if (message && typeof message === "object" && !message.type && message.message) {
      const nestedMessage = typeof message.message === "string" ? JSON.parse(message.message) : message.message;
      return unwrapRelayMessage(nestedMessage);
    }
    if (message && Number(message.t) === 1 && typeof message.contentJsonDump === "string") {
      const content = JSON.parse(message.contentJsonDump);
      if (content.customPacketType && content.customPacketType !== "skyrimRp") {
        return __spreadValues({
          type: String(content.customPacketType)
        }, content);
      }
      return content;
    }
    return message;
  }
  function safeStringValue(value) {
    try {
      return String(value);
    } catch (e) {
      return "";
    }
  }
  function safeJsonStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return "";
    }
  }
  function parseJsonCandidate(value) {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    if (!trimmed || !["{", "["].includes(trimmed[0])) {
      return null;
    }
    return JSON.parse(trimmed);
  }
  function isArrayBufferLike(value) {
    try {
      return value && typeof value === "object" && Object.prototype.toString.call(value) === "[object ArrayBuffer]";
    } catch (e) {
      return false;
    }
  }
  function decodeArrayBuffer(value) {
    const bytes = new Uint8Array(value);
    try {
      if (typeof TextDecoder === "function") {
        return new TextDecoder("utf-8").decode(bytes);
      }
    } catch (e) {
    }
    let decoded = "";
    const chunkSize = 8192;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      decoded += String.fromCharCode(...bytes.slice(index, index + chunkSize));
    }
    return decoded;
  }
  function parseRelayJsonContent(jsonContent) {
    if (typeof jsonContent === "string") {
      return JSON.parse(jsonContent);
    }
    if (!jsonContent || typeof jsonContent !== "object") {
      return jsonContent;
    }
    if (isArrayBufferLike(jsonContent)) {
      return JSON.parse(decodeArrayBuffer(jsonContent));
    }
    try {
      const valueOf = typeof jsonContent.valueOf === "function" ? jsonContent.valueOf() : null;
      const parsedValueOf = parseJsonCandidate(valueOf);
      if (parsedValueOf) {
        return parsedValueOf;
      }
    } catch (e) {
    }
    const stringValue = safeStringValue(jsonContent);
    if (stringValue && stringValue !== "[object Object]") {
      const parsedString = parseJsonCandidate(stringValue);
      if (parsedString) {
        return parsedString;
      }
    }
    const jsonValue = safeJsonStringify(jsonContent);
    if (jsonValue && jsonValue !== "{}" && jsonValue !== "[]") {
      const parsedJson = parseJsonCandidate(jsonValue);
      if (parsedJson) {
        return parsedJson;
      }
    }
    return jsonContent;
  }
  function summarizeRelayPacket({ packetType, jsonContent, error, rawMessage, message, parseError }) {
    var _a;
    const summary = {
      packetType: String(packetType || ""),
      hasJsonContent: Boolean(jsonContent),
      jsonContentType: typeof jsonContent
    };
    if (typeof jsonContent === "string") {
      summary.jsonContentLength = jsonContent.length;
    }
    if (error) {
      summary.error = String(error);
    }
    if (parseError) {
      summary.parseError = parseError instanceof Error ? parseError.message : String(parseError);
    }
    if (jsonContent && typeof jsonContent === "object") {
      try {
        summary.jsonContentObjectTag = Object.prototype.toString.call(jsonContent);
      } catch (e) {
        summary.jsonContentObjectTag = "unavailable";
      }
      try {
        const constructorName = (_a = jsonContent.constructor) == null ? void 0 : _a.name;
        if (constructorName) {
          summary.jsonContentConstructor = String(constructorName);
        }
      } catch (e) {
        summary.jsonContentConstructor = "unavailable";
      }
      try {
        const ownNames = Object.getOwnPropertyNames(jsonContent).slice(0, 8);
        if (ownNames.length > 0) {
          summary.jsonContentOwnProperties = ownNames.join(",");
        }
      } catch (e) {
        summary.jsonContentOwnProperties = "unavailable";
      }
      for (const propertyName of ["message", "contentJsonDump", "t", "type", "customPacketType", "payload", "data"]) {
        try {
          if (propertyName in jsonContent) {
            summary[`jsonContentHas_${propertyName}`] = true;
            const propertyValue = jsonContent[propertyName];
            if (propertyValue === null || ["string", "number", "boolean"].includes(typeof propertyValue)) {
              summary[`jsonContent_${propertyName}`] = String(propertyValue).slice(0, 160);
            } else {
              summary[`jsonContent_${propertyName}_type`] = typeof propertyValue;
            }
          }
        } catch (e) {
          summary[`jsonContentHas_${propertyName}`] = "unavailable";
        }
      }
      const stringValue = safeStringValue(jsonContent);
      if (stringValue && stringValue !== "[object Object]") {
        summary.jsonContentStringLength = stringValue.length;
        summary.jsonContentStringPreview = stringValue.slice(0, 180);
      }
      const jsonValue = safeJsonStringify(jsonContent);
      if (jsonValue && jsonValue !== "{}" && jsonValue !== "[]") {
        summary.jsonContentJsonLength = jsonValue.length;
        summary.jsonContentJsonPreview = jsonValue.slice(0, 180);
      }
      if (isArrayBufferLike(jsonContent)) {
        try {
          summary.jsonContentByteLength = Number(jsonContent.byteLength || 0);
          const decoded = decodeArrayBuffer(jsonContent);
          summary.jsonContentDecodedLength = decoded.length;
          summary.jsonContentDecodedPreview = decoded.slice(0, 180);
        } catch (caught) {
          summary.jsonContentDecodedError = caught instanceof Error ? caught.message : String(caught);
        }
      }
    }
    if (rawMessage && typeof rawMessage === "object") {
      const rawMessageKeys = Object.keys(rawMessage).slice(0, 8);
      if (rawMessageKeys.length > 0) {
        summary.rawMessageKeys = rawMessageKeys.join(",");
      }
      if ("t" in rawMessage) {
        summary.wrapperType = Number(rawMessage.t);
      }
      if (typeof rawMessage.contentJsonDump === "string") {
        summary.contentJsonDumpLength = rawMessage.contentJsonDump.length;
      }
      if (rawMessage.message && typeof rawMessage.message === "object") {
        const nestedKeys = Object.keys(rawMessage.message).slice(0, 8);
        if (nestedKeys.length > 0) {
          summary.nestedMessageKeys = nestedKeys.join(",");
        }
        if ("t" in rawMessage.message) {
          summary.nestedWrapperType = Number(rawMessage.message.t);
        }
        if (typeof rawMessage.message.contentJsonDump === "string") {
          summary.nestedContentJsonDumpLength = rawMessage.message.contentJsonDump.length;
        }
      }
    }
    if (message && typeof message === "object") {
      if (message.type) {
        summary.messageType = String(message.type);
      }
      if (message.customPacketType) {
        summary.customPacketType = String(message.customPacketType);
      }
      if (Array.isArray(message.activeNpcSpawns)) {
        summary.activeNpcSpawnCount = message.activeNpcSpawns.length;
        summary.activeNpcSpawnIds = message.activeNpcSpawns.map((spawn) => optionalText(spawn == null ? void 0 : spawn.id)).filter(Boolean).slice(0, 8).join(",");
      }
      if (Array.isArray(message.spawns)) {
        summary.npcSpawnCount = message.spawns.length;
        summary.npcSpawnIds = message.spawns.map((spawn) => optionalText(spawn == null ? void 0 : spawn.id)).filter(Boolean).slice(0, 8).join(",");
      }
    }
    return summary;
  }
  function createSkyrimPlatformHttpAdapter(HttpClient2, backendUrl2) {
    const baseUrl = normalizeBackendUrl(backendUrl2);
    const client = new HttpClient2(baseUrl);
    return {
      get(_0) {
        return __async(this, arguments, function* (path, { auth = null } = {}) {
          const response = yield client.get(path, {
            headers: auth ? authHeaders(auth) : {}
          });
          return parseJsonResponse(response, path);
        });
      },
      post(_0, _1) {
        return __async(this, arguments, function* (path, body, { auth = null } = {}) {
          const response = yield client.post(path, {
            body: JSON.stringify(body || {}),
            contentType: "application/json",
            headers: auth ? authHeaders(auth) : {}
          });
          return parseJsonResponse(response, path);
        });
      }
    };
  }
  function createJoinPhaseReporter(http2) {
    if (!http2 || typeof http2.post !== "function") {
      throw new Error("http adapter with post is required");
    }
    return function reportJoinPhase(_0) {
      return __async(this, arguments, function* ({ phase, auth, character = null, queue = null, details = {} }) {
        if (!(auth == null ? void 0 : auth.accountId) || !(auth == null ? void 0 : auth.sessionToken)) {
          return;
        }
        const payload = {
          eventType: "join_phase",
          phase,
          details: __spreadValues(__spreadValues({}, details), (queue == null ? void 0 : queue.queueId) ? { queueId: queue.queueId } : {})
        };
        if (character == null ? void 0 : character.id) {
          payload.characterId = character.id;
        }
        yield http2.post("/client-events", payload, { auth });
      });
    };
  }
  function createSkyMpPlaySessionForCharacter(_0) {
    return __async(this, arguments, function* ({
      http: http2,
      auth,
      characterId,
      masterKey
    }) {
      if (!http2 || typeof http2.post !== "function") {
        throw new Error("http adapter with post is required");
      }
      if (!(auth == null ? void 0 : auth.accountId) || !(auth == null ? void 0 : auth.sessionToken)) {
        throw new Error("auth is required");
      }
      const cleanMasterKey = optionalText(masterKey, "main");
      const result = yield http2.post(
        `/api/users/me/play/${encodeURIComponent(cleanMasterKey)}`,
        { characterId: assertText(characterId, "characterId") },
        { auth }
      );
      const session = assertText(result.session || result.playSession, "playSession.session");
      const profileId = Number(result.profileId);
      if (!Number.isInteger(profileId) || profileId < 1) {
        throw new Error("playSession.profileId must be a positive integer");
      }
      return {
        id: optionalText(result.id),
        session,
        playSession: session,
        masterKey: optionalText(result.masterKey, cleanMasterKey),
        accountId: optionalText(result.accountId, auth.accountId),
        characterId: assertText(result.characterId || characterId, "playSession.characterId"),
        profileId,
        expiresAt: optionalText(result.expiresAt),
        createdAt: optionalText(result.createdAt)
      };
    });
  }
  function createClientDiagnosticReporter(http2, { sourceId = "skyrim-platform-client" } = {}) {
    if (!http2 || typeof http2.post !== "function") {
      throw new Error("http adapter with post is required");
    }
    return function reportClientDiagnostic2(_0) {
      return __async(this, arguments, function* (eventType, details = {}) {
        yield http2.post("/client-diagnostics", {
          eventType,
          sourceId,
          details
        });
      });
    };
  }
  function buildHelloPacket({ config, auth, character, queue, position }) {
    return {
      type: "hello",
      protocolVersion: Number(config.protocolVersion || defaultProtocolVersion),
      serverId: optionalText(config.serverId, "main"),
      accountId: auth.accountId,
      characterId: character.id,
      displayName: optionalText(config.displayName, character.name),
      sessionToken: auth.sessionToken,
      reservationToken: queue.reservationToken,
      worldspace: optionalText(position.worldspace, "Tamriel"),
      cell: optionalText(position.cell, "unknown"),
      x: Number(position.x || 0),
      y: Number(position.y || 0),
      z: Number(position.z || 0),
      rotationZ: Number(position.rotationZ || 0)
    };
  }
  function buildSkyMpLoginPacket({ playSessionToken }) {
    return {
      t: skympCustomPacketMessageType,
      contentJsonDump: JSON.stringify({
        customPacketType: "loginWithSkympIo",
        gameData: {
          session: assertText(playSessionToken, "playSessionToken")
        }
      })
    };
  }
  function buildTransformPacket(position) {
    return {
      type: "transform",
      worldspace: optionalText(position.worldspace, "Tamriel"),
      cell: optionalText(position.cell, "unknown"),
      x: Number(position.x || 0),
      y: Number(position.y || 0),
      z: Number(position.z || 0),
      rotationZ: Number(position.rotationZ || 0)
    };
  }
  function publicPositionFromPacket(packet) {
    if (!packet || typeof packet !== "object") {
      return null;
    }
    return {
      worldspace: optionalText(packet.worldspace, "Tamriel"),
      cell: optionalText(packet.cell, "unknown"),
      x: Number(packet.x || 0),
      y: Number(packet.y || 0),
      z: Number(packet.z || 0),
      rotationZ: Number(packet.rotationZ || 0)
    };
  }
  function createRpJoinContract({
    config,
    http: http2,
    relay,
    getPosition = () => ({}),
    logger = (_message) => {
    },
    reportJoinPhase = (_event) => __async(null, null, function* () {
    }),
    onPeerEvent = (_event) => {
    },
    onOwnerSnapshot = (_snapshot) => {
    },
    onNpcSpawnEvent = (_event) => {
    },
    onResourceEvent = (_event) => {
    },
    onChatEvent = (_event) => {
    },
    onTradeEvent = (_event) => {
    },
    onCraftEvent = (_event) => {
    },
    onSpellEvent = (_event) => {
    },
    onProfessionEvent = (_event) => {
    },
    onJobEvent = (_event) => {
    },
    onNoticeEvent = (_event) => {
    },
    onCourierEvent = (_event) => {
    },
    onLawEvent = (_event) => {
    },
    onInjuryEvent = (_event) => {
    },
    onBusinessEvent = (_event) => {
    },
    onPropertyEvent = (_event) => {
    },
    onOnboardingEvent = (_event) => {
    },
    onRelayPacket = (_event) => {
    }
  }) {
    var _a;
    if (!config || typeof config !== "object") {
      throw new Error("config is required");
    }
    const normalizedConfig = __spreadProps(__spreadValues({}, config), {
      backendUrl: normalizeBackendUrl(config.backendUrl),
      relayHost: optionalText(config.relayHost, "127.0.0.1"),
      relayPort: Number(config.relayPort || 3118),
      serverId: optionalText(config.serverId, "main"),
      transformIntervalMs: Number(config.transformIntervalMs || 250),
      queuePollIntervalMs: Number(config.queuePollIntervalMs || 1e3),
      queueTimeoutMs: Number(config.queueTimeoutMs || 12e4),
      clientEventRetryAttempts: Number(config.clientEventRetryAttempts || 3),
      clientEventRetryDelayMs: Number(config.clientEventRetryDelayMs || 75),
      awaitClientEvents: optionalEnabled(config.awaitClientEvents, true),
      waitForRelayAccepted: optionalEnabled(config.waitForRelayAccepted, false),
      relayAcceptedFallbackMs: Number((_a = config.relayAcceptedFallbackMs) != null ? _a : 1500),
      inGameCharacterSelection: optionalEnabled(config.inGameCharacterSelection, false),
      createPlaySessionInGame: optionalEnabled(config.createPlaySessionInGame, false)
    });
    if (!Number.isInteger(normalizedConfig.relayPort) || normalizedConfig.relayPort <= 0) {
      throw new Error("relayPort must be a positive integer");
    }
    if (!Number.isFinite(normalizedConfig.transformIntervalMs) || normalizedConfig.transformIntervalMs <= 0) {
      throw new Error("transformIntervalMs must be a positive number");
    }
    if (!Number.isFinite(normalizedConfig.queuePollIntervalMs) || normalizedConfig.queuePollIntervalMs <= 0) {
      throw new Error("queuePollIntervalMs must be a positive number");
    }
    if (!Number.isFinite(normalizedConfig.queueTimeoutMs) || normalizedConfig.queueTimeoutMs <= 0) {
      throw new Error("queueTimeoutMs must be a positive number");
    }
    if (!Number.isInteger(normalizedConfig.clientEventRetryAttempts) || normalizedConfig.clientEventRetryAttempts <= 0) {
      throw new Error("clientEventRetryAttempts must be a positive integer");
    }
    if (!Number.isFinite(normalizedConfig.clientEventRetryDelayMs) || normalizedConfig.clientEventRetryDelayMs < 0) {
      throw new Error("clientEventRetryDelayMs must be a non-negative number");
    }
    if (!Number.isFinite(normalizedConfig.relayAcceptedFallbackMs) || normalizedConfig.relayAcceptedFallbackMs < 0) {
      throw new Error("relayAcceptedFallbackMs must be a non-negative number");
    }
    if (!http2 || typeof http2.post !== "function" || typeof http2.get !== "function") {
      throw new Error("http adapter with get/post is required");
    }
    if (!relay || typeof relay.createClient !== "function" || typeof relay.send !== "function" || typeof relay.tick !== "function") {
      throw new Error("relay adapter with createClient/send/tick is required");
    }
    const state = {
      phase: "idle",
      auth: null,
      character: null,
      characterSlots: {
        characters: [],
        maxCharactersPerAccount: null,
        availableSlots: null
      },
      queue: null,
      position: null,
      hello: null,
      welcome: null,
      ownerSnapshot: null,
      onboarding: null,
      lastOwnerSnapshotReason: null,
      lastOwnerSnapshotError: null,
      lastCharacterIntroduceResult: null,
      lastWalletSyncResult: null,
      lastWalletSyncError: null,
      lastWalletSyncSentAt: null,
      lastWalletSyncGold: null,
      lastAccountStipendResult: null,
      lastOnboardingEvent: null,
      lastOnboardingEventError: null,
      jobBoard: [],
      lastChatEvent: null,
      lastChatEventError: null,
      lastTradeEvent: null,
      lastTradeEventError: null,
      lastTradeRequest: null,
      lastCraftEvent: null,
      lastCraftEventError: null,
      lastSpellEvent: null,
      lastSpellEventError: null,
      recipes: [],
      professionInvitations: [],
      lastProfessionEvent: null,
      lastProfessionEventError: null,
      lastGuildEvent: null,
      lastGuildEventError: null,
      lastJobEvent: null,
      lastJobEventError: null,
      noticeBoards: [],
      noticeBoardPosts: [],
      lastNoticeEvent: null,
      lastNoticeEventError: null,
      courierBoard: [],
      lastCourierEvent: null,
      lastCourierEventError: null,
      taxiRoutes: [],
      taxiContracts: [],
      lastTaxiEvent: null,
      lastTaxiEventError: null,
      jailTasks: [],
      lastJailEvent: null,
      lastJailEventError: null,
      wantedBoard: [],
      lastLawEvent: null,
      lastLawEventError: null,
      medicalCalls: [],
      lastInjuryEvent: null,
      lastInjuryEventError: null,
      businessOrders: [],
      businessListings: [],
      lastBusinessEvent: null,
      lastBusinessEventError: null,
      propertyListings: [],
      propertySaleListings: [],
      propertyCharges: [],
      propertyStorage: {},
      propertyUpgrades: {},
      storageAuctionEvents: [],
      storageAuctionLots: [],
      lastPropertyEvent: null,
      lastPropertyEventError: null,
      npcSpawns: {},
      lastNpcSpawnEvent: null,
      lastNpcSpawnEventError: null,
      resourceNodes: {},
      lastResourceEvent: null,
      lastResourceEventError: null,
      peers: {},
      lastPeerEvent: null,
      lastPeerEventError: null,
      lastCharacterInspectResult: null,
      lastCharacterTitleResult: null,
      speaking: false,
      lastVoiceStateSentAt: null,
      lastError: null,
      lastRelayActionError: null,
      lastTransformSentAt: null,
      relayConnectionStartedAt: null,
      relayAcceptedFallbackSent: false,
      helloSent: false,
      skyMpLoginSent: false,
      skyMpLogin: null,
      playSession: null
    };
    function setPhase(phase) {
      state.phase = phase;
      logger(`phase=${phase}`);
    }
    function sendPhase(_0) {
      return __async(this, arguments, function* (phase, details = {}) {
        if (typeof reportJoinPhase !== "function" || !state.auth) {
          return;
        }
        let lastError = null;
        for (let attempt = 1; attempt <= normalizedConfig.clientEventRetryAttempts; attempt += 1) {
          try {
            yield reportJoinPhase({
              phase,
              auth: state.auth,
              character: state.character,
              queue: state.queue,
              details
            });
            return;
          } catch (error) {
            lastError = error;
            if (attempt < normalizedConfig.clientEventRetryAttempts) {
              logger(`client_event_retry phase=${phase} attempt=${attempt}: ${error.message || String(error)}`);
              yield sleep(normalizedConfig.clientEventRetryDelayMs * attempt);
            }
          }
        }
        logger(`client_event_failed phase=${phase}: ${(lastError == null ? void 0 : lastError.message) || String(lastError)}`);
      });
    }
    function reportPhase(phase, details = {}) {
      const send = sendPhase(phase, details);
      if (normalizedConfig.awaitClientEvents === false) {
        send.catch((error) => {
          logger(`client_event_async_failed phase=${phase}: ${error.message || String(error)}`);
        });
        return Promise.resolve();
      }
      return send;
    }
    function sendHelloPacket() {
      return __async(this, arguments, function* (details = {}) {
        if (state.helloSent || !state.hello) {
          return false;
        }
        relay.send(state.hello, true);
        state.helloSent = true;
        state.position = publicPositionFromPacket(state.hello);
        setPhase("waiting_welcome");
        yield reportPhase("waiting_welcome", __spreadValues({
          worldspace: state.hello.worldspace,
          cell: state.hello.cell
        }, details));
        return true;
      });
    }
    function sendSkyMpLoginPacket(details = {}) {
      const playSessionToken = optionalText(normalizedConfig.playSessionToken);
      if (!playSessionToken || state.skyMpLoginSent) {
        return false;
      }
      if (typeof relay.sendSkyMpLoginPacket !== "function") {
        logger("skymp_login_packet_not_supported");
        return false;
      }
      const packet = buildSkyMpLoginPacket({ playSessionToken });
      relay.sendSkyMpLoginPacket(packet, true);
      state.skyMpLoginSent = true;
      state.skyMpLogin = {
        masterKey: optionalText(normalizedConfig.playSessionMasterKey, normalizedConfig.serverId),
        profileId: normalizedConfig.skympProfileId === void 0 || normalizedConfig.skympProfileId === null ? "" : String(normalizedConfig.skympProfileId).trim(),
        expiresAt: optionalText(normalizedConfig.playSessionExpiresAt),
        source: optionalText(details.source)
      };
      logger(`skymp_login_sent masterKey=${state.skyMpLogin.masterKey} profileId=${state.skyMpLogin.profileId || "unknown"}`);
      return true;
    }
    function createInGamePlaySession(auth, character) {
      return __async(this, null, function* () {
        if (!normalizedConfig.createPlaySessionInGame || optionalText(normalizedConfig.playSessionToken)) {
          return state.playSession;
        }
        const masterKey = optionalText(normalizedConfig.playSessionMasterKey, normalizedConfig.serverId);
        const playSession = yield createSkyMpPlaySessionForCharacter({
          http: http2,
          auth,
          characterId: character.id,
          masterKey
        });
        normalizedConfig.playSessionToken = playSession.session;
        normalizedConfig.playSessionExpiresAt = playSession.expiresAt;
        normalizedConfig.playSessionMasterKey = playSession.masterKey;
        normalizedConfig.skympProfileId = playSession.profileId;
        state.playSession = playSession;
        logger(`skymp_play_session_created masterKey=${playSession.masterKey} profileId=${playSession.profileId}`);
        return playSession;
      });
    }
    function markRelayConnectionStarted() {
      state.relayConnectionStartedAt = Date.now();
      state.relayAcceptedFallbackSent = false;
    }
    function maybeSendRelayAcceptedFallback() {
      if (!normalizedConfig.waitForRelayAccepted || normalizedConfig.relayAcceptedFallbackMs <= 0) {
        return false;
      }
      if (state.phase !== "connecting_relay" || state.helloSent || state.relayAcceptedFallbackSent) {
        return false;
      }
      if (!state.relayConnectionStartedAt) {
        return false;
      }
      const elapsedMs = Date.now() - state.relayConnectionStartedAt;
      if (elapsedMs < normalizedConfig.relayAcceptedFallbackMs) {
        return false;
      }
      state.relayAcceptedFallbackSent = true;
      logger(`relay_connection_accepted_fallback_after=${elapsedMs}ms`);
      sendSkyMpLoginPacket({ source: "connectionAcceptedFallback" });
      void sendHelloPacket({ source: "connectionAcceptedFallback" });
      return true;
    }
    function emitPeerEvent(event) {
      state.lastPeerEvent = event;
      state.lastPeerEventError = null;
      if (typeof onPeerEvent !== "function") {
        return;
      }
      try {
        onPeerEvent(event);
      } catch (error) {
        state.lastPeerEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`peer_event_failed type=${event.type}: ${state.lastPeerEventError}`);
      }
    }
    function applyOwnerSnapshot(message, fallbackReason) {
      const snapshot = normalizeOwnerSnapshot(message, fallbackReason);
      state.ownerSnapshot = snapshot;
      state.onboarding = snapshot.onboarding;
      state.professionInvitations = snapshot.professionInvitations;
      state.propertyCharges = snapshot.propertyCharges;
      state.propertySaleListings = snapshot.available.propertySaleListings;
      state.lastOwnerSnapshotReason = snapshot.reason;
      state.lastOwnerSnapshotError = null;
      if (typeof onOwnerSnapshot !== "function") {
        return snapshot;
      }
      try {
        onOwnerSnapshot(snapshot);
      } catch (error) {
        state.lastOwnerSnapshotError = (error == null ? void 0 : error.message) || String(error);
        logger(`owner_snapshot_failed reason=${snapshot.reason}: ${state.lastOwnerSnapshotError}`);
      }
      return snapshot;
    }
    function emitTradeEvent(event) {
      state.lastTradeEvent = event;
      state.lastTradeEventError = null;
      if (typeof onTradeEvent !== "function") {
        return;
      }
      try {
        onTradeEvent(event);
      } catch (error) {
        state.lastTradeEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`trade_event_failed type=${event.type}: ${state.lastTradeEventError}`);
      }
    }
    function emitChatEvent(event) {
      state.lastChatEvent = event;
      state.lastChatEventError = null;
      if (typeof onChatEvent !== "function") {
        return;
      }
      try {
        onChatEvent(event);
      } catch (error) {
        state.lastChatEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`chat_event_failed type=${event.type}: ${state.lastChatEventError}`);
      }
    }
    function emitCraftEvent(event) {
      state.lastCraftEvent = event;
      state.lastCraftEventError = null;
      if (typeof onCraftEvent !== "function") {
        return;
      }
      try {
        onCraftEvent(event);
      } catch (error) {
        state.lastCraftEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`craft_event_failed type=${event.type}: ${state.lastCraftEventError}`);
      }
    }
    function emitSpellEvent(event) {
      state.lastSpellEvent = event;
      state.lastSpellEventError = null;
      if (typeof onSpellEvent !== "function") {
        return;
      }
      try {
        onSpellEvent(event);
      } catch (error) {
        state.lastSpellEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`spell_event_failed type=${event.type}: ${state.lastSpellEventError}`);
      }
    }
    function emitProfessionEvent(event) {
      state.lastProfessionEvent = event;
      state.lastProfessionEventError = null;
      if (typeof onProfessionEvent !== "function") {
        return;
      }
      try {
        onProfessionEvent(event);
      } catch (error) {
        state.lastProfessionEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`profession_event_failed type=${event.type}: ${state.lastProfessionEventError}`);
      }
    }
    function upsertProfessionInvitation(invitation) {
      if (!(invitation == null ? void 0 : invitation.id)) {
        return;
      }
      state.professionInvitations = [
        invitation,
        ...state.professionInvitations.filter((entry) => entry.id !== invitation.id)
      ];
    }
    function emitJobEvent(event) {
      state.lastJobEvent = event;
      state.lastJobEventError = null;
      if (typeof onJobEvent !== "function") {
        return;
      }
      try {
        onJobEvent(event);
      } catch (error) {
        state.lastJobEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`job_event_failed type=${event.type}: ${state.lastJobEventError}`);
      }
    }
    function emitNoticeEvent(event) {
      state.lastNoticeEvent = event;
      state.lastNoticeEventError = null;
      if (typeof onNoticeEvent !== "function") {
        return;
      }
      try {
        onNoticeEvent(event);
      } catch (error) {
        state.lastNoticeEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`notice_event_failed type=${event.type}: ${state.lastNoticeEventError}`);
      }
    }
    function emitCourierEvent(event) {
      state.lastCourierEvent = event;
      state.lastCourierEventError = null;
      if (typeof onCourierEvent !== "function") {
        return;
      }
      try {
        onCourierEvent(event);
      } catch (error) {
        state.lastCourierEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`courier_event_failed type=${event.type}: ${state.lastCourierEventError}`);
      }
    }
    function emitLawEvent(event) {
      state.lastLawEvent = event;
      state.lastLawEventError = null;
      if (typeof onLawEvent !== "function") {
        return;
      }
      try {
        onLawEvent(event);
      } catch (error) {
        state.lastLawEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`law_event_failed type=${event.type}: ${state.lastLawEventError}`);
      }
    }
    function emitInjuryEvent(event) {
      state.lastInjuryEvent = event;
      state.lastInjuryEventError = null;
      if (typeof onInjuryEvent !== "function") {
        return;
      }
      try {
        onInjuryEvent(event);
      } catch (error) {
        state.lastInjuryEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`injury_event_failed type=${event.type}: ${state.lastInjuryEventError}`);
      }
    }
    function emitBusinessEvent(event) {
      state.lastBusinessEvent = event;
      state.lastBusinessEventError = null;
      if (typeof onBusinessEvent !== "function") {
        return;
      }
      try {
        onBusinessEvent(event);
      } catch (error) {
        state.lastBusinessEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`business_event_failed type=${event.type}: ${state.lastBusinessEventError}`);
      }
    }
    function emitPropertyEvent(event) {
      var _a2, _b2;
      if (((_a2 = event == null ? void 0 : event.property) == null ? void 0 : _a2.id) && Array.isArray(event.storage)) {
        state.propertyStorage[event.property.id] = event.storage;
      }
      if (((_b2 = event == null ? void 0 : event.property) == null ? void 0 : _b2.id) && Array.isArray(event.upgrades)) {
        state.propertyUpgrades[event.property.id] = event.upgrades;
      }
      state.lastPropertyEvent = event;
      state.lastPropertyEventError = null;
      if (typeof onPropertyEvent !== "function") {
        return;
      }
      try {
        onPropertyEvent(event);
      } catch (error) {
        state.lastPropertyEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`property_event_failed type=${event.type}: ${state.lastPropertyEventError}`);
      }
    }
    function updateStorageAuctionLot(lot) {
      if (!(lot == null ? void 0 : lot.id)) {
        return;
      }
      const index = state.storageAuctionLots.findIndex((entry) => entry.id === lot.id);
      if (index === -1) {
        state.storageAuctionLots = [lot, ...state.storageAuctionLots];
        return;
      }
      state.storageAuctionLots = [
        ...state.storageAuctionLots.slice(0, index),
        lot,
        ...state.storageAuctionLots.slice(index + 1)
      ];
    }
    function updatePropertySaleListing(listing) {
      if (!(listing == null ? void 0 : listing.id)) {
        return;
      }
      const index = state.propertySaleListings.findIndex((entry) => entry.id === listing.id);
      if (index === -1) {
        state.propertySaleListings = [listing, ...state.propertySaleListings];
        return;
      }
      state.propertySaleListings = [
        ...state.propertySaleListings.slice(0, index),
        listing,
        ...state.propertySaleListings.slice(index + 1)
      ];
    }
    function emitNpcSpawnEvent(event) {
      state.lastNpcSpawnEvent = event;
      state.lastNpcSpawnEventError = null;
      if (typeof onNpcSpawnEvent !== "function") {
        return;
      }
      try {
        onNpcSpawnEvent(event);
      } catch (error) {
        state.lastNpcSpawnEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`npc_spawn_event_failed type=${event.type}: ${state.lastNpcSpawnEventError}`);
      }
    }
    function emitResourceEvent(event) {
      state.lastResourceEvent = event;
      state.lastResourceEventError = null;
      if (typeof onResourceEvent !== "function") {
        return;
      }
      try {
        onResourceEvent(event);
      } catch (error) {
        state.lastResourceEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`resource_event_failed type=${event.type}: ${state.lastResourceEventError}`);
      }
    }
    function emitOnboardingEvent(event) {
      state.lastOnboardingEvent = event;
      state.lastOnboardingEventError = null;
      if (event.onboarding) {
        state.onboarding = event.onboarding;
      }
      if (typeof onOnboardingEvent !== "function") {
        return;
      }
      try {
        onOnboardingEvent(event);
      } catch (error) {
        state.lastOnboardingEventError = (error == null ? void 0 : error.message) || String(error);
        logger(`onboarding_event_failed type=${event.type}: ${state.lastOnboardingEventError}`);
      }
    }
    function applyNpcSpawnSnapshot(spawns, reason = "snapshot") {
      state.npcSpawns = {};
      for (const spawn of optionalArray(spawns)) {
        const normalizedSpawn = normalizeNpcSpawn(spawn);
        state.npcSpawns[normalizedSpawn.id] = normalizedSpawn;
      }
      emitNpcSpawnEvent({
        type: "snapshot",
        reason,
        spawns: Object.values(state.npcSpawns)
      });
    }
    function applyResourceNodeSnapshot(nodes, reason = "snapshot") {
      state.resourceNodes = {};
      for (const node of optionalArray(nodes)) {
        const normalizedNode = normalizeResourceNode(node);
        state.resourceNodes[normalizedNode.code] = normalizedNode;
      }
      emitResourceEvent({
        type: "snapshot",
        reason,
        nodes: Object.values(state.resourceNodes)
      });
    }
    function applyNpcSpawn(spawn, eventType, extra = {}) {
      const normalizedSpawn = normalizeNpcSpawn(spawn);
      if (normalizedSpawn.status === "active") {
        state.npcSpawns[normalizedSpawn.id] = normalizedSpawn;
      } else {
        delete state.npcSpawns[normalizedSpawn.id];
      }
      emitNpcSpawnEvent(__spreadValues({
        type: eventType,
        spawnId: normalizedSpawn.id,
        spawn: normalizedSpawn
      }, extra));
    }
    function resolveAuth() {
      return __async(this, null, function* () {
        var _a2;
        const accountId = optionalText(normalizedConfig.accountId);
        const sessionToken = optionalText(normalizedConfig.sessionToken);
        if (accountId && sessionToken) {
          return { accountId, sessionToken };
        }
        const username = assertText(normalizedConfig.username, "username");
        const password = assertText(normalizedConfig.password, "password");
        const login = yield http2.post("/auth/login", { username, password });
        return {
          accountId: assertText((_a2 = login.account) == null ? void 0 : _a2.id, "login.account.id"),
          sessionToken: assertText(login.sessionToken, "login.sessionToken")
        };
      });
    }
    function resolveCharacter(auth) {
      return __async(this, null, function* () {
        const configuredCharacterId = optionalText(normalizedConfig.characterId);
        if (configuredCharacterId) {
          return {
            id: configuredCharacterId,
            name: optionalText(normalizedConfig.characterName, optionalText(normalizedConfig.displayName, "RP Test Character"))
          };
        }
        const characters = yield http2.get("/characters", { auth });
        state.characterSlots = normalizeCharacterSlots(characters);
        if (normalizedConfig.inGameCharacterSelection) {
          return null;
        }
        const desiredName = optionalText(normalizedConfig.characterName, "RP Test Character");
        const existing = state.characterSlots.characters.find((character) => character.name === desiredName);
        if (existing) {
          return {
            id: assertText(existing.id, "character.id"),
            name: assertText(existing.name, "character.name")
          };
        }
        if (normalizedConfig.autoCreateCharacter === false) {
          throw new Error(`character '${desiredName}' was not found and autoCreateCharacter=false`);
        }
        const created = yield http2.post("/characters", {
          accountId: auth.accountId,
          name: desiredName
        }, { auth });
        const createdCharacter = normalizeCharacterSummary(created);
        const charactersAfterCreate = [
          createdCharacter,
          ...state.characterSlots.characters.filter((character) => character.id !== createdCharacter.id)
        ];
        const availableSlotsAfterCreate = state.characterSlots.maxCharactersPerAccount === null ? state.characterSlots.availableSlots === null ? null : Math.max(0, state.characterSlots.availableSlots - 1) : Math.max(0, state.characterSlots.maxCharactersPerAccount - charactersAfterCreate.length);
        state.characterSlots = __spreadProps(__spreadValues({}, state.characterSlots), {
          characters: charactersAfterCreate,
          availableSlots: availableSlotsAfterCreate
        });
        return {
          id: createdCharacter.id,
          name: createdCharacter.name
        };
      });
    }
    function ensureCharacterSlots() {
      return __async(this, arguments, function* (auth = state.auth) {
        const activeAuth = auth || (yield resolveAuth());
        state.auth = activeAuth;
        const characters = yield http2.get("/characters", { auth: activeAuth });
        state.characterSlots = normalizeCharacterSlots(characters);
        return state.characterSlots;
      });
    }
    function preparedQueue(auth, character) {
      const reservationToken = optionalText(normalizedConfig.reservationToken);
      if (!reservationToken) {
        return null;
      }
      return {
        queueId: optionalText(normalizedConfig.queueId, `prepared-${character.id}`),
        accountId: auth.accountId,
        characterId: character.id,
        serverId: normalizedConfig.serverId,
        status: "reserved",
        reservationToken,
        reservationExpiresAt: optionalText(normalizedConfig.reservationExpiresAt),
        position: null,
        queueSize: Number(normalizedConfig.queueSize || 0),
        serverOnline: Number(normalizedConfig.serverOnline || 0),
        serverMax: Number(normalizedConfig.serverMax || 0),
        createdAt: optionalText(normalizedConfig.reservationCreatedAt),
        updatedAt: optionalText(normalizedConfig.reservationCreatedAt)
      };
    }
    function connectPreparedReservation() {
      const accountId = optionalText(normalizedConfig.accountId);
      const sessionToken = optionalText(normalizedConfig.sessionToken);
      const characterId = optionalText(normalizedConfig.characterId);
      if (!accountId || !sessionToken || !characterId) {
        return null;
      }
      const auth = { accountId, sessionToken };
      const character = {
        id: characterId,
        name: optionalText(normalizedConfig.characterName, optionalText(normalizedConfig.displayName, "RP Test Character"))
      };
      const queue = preparedQueue(auth, character);
      if (!queue) {
        return null;
      }
      setPhase("authenticating");
      state.auth = auth;
      void reportPhase("authenticated");
      setPhase("selecting_character");
      state.character = character;
      void reportPhase("selecting_character");
      setPhase("joining_queue");
      state.queue = queue;
      void reportPhase("joining_queue");
      setPhase("connecting_relay");
      void reportPhase("connecting_relay", {
        relayHost: normalizedConfig.relayHost,
        relayPort: normalizedConfig.relayPort,
        preparedReservation: true
      });
      relay.createClient(normalizedConfig.relayHost, normalizedConfig.relayPort);
      markRelayConnectionStarted();
      state.hello = buildHelloPacket({
        config: normalizedConfig,
        auth,
        character,
        queue,
        position: getPosition()
      });
      if (normalizedConfig.waitForRelayAccepted) {
        logger("waiting_for_relay_connection_accepted");
      } else {
        void sendHelloPacket({ preparedReservation: true });
      }
      return {
        auth,
        character,
        queue,
        hello: state.hello
      };
    }
    function waitForQueueReservation(auth, initialQueue) {
      return __async(this, null, function* () {
        var _a2, _b2;
        state.queue = initialQueue;
        if (initialQueue.status === "reserved" && initialQueue.reservationToken) {
          return initialQueue;
        }
        if (initialQueue.status !== "queued") {
          throw new Error(`queue did not return a usable reservation, status=${initialQueue.status}`);
        }
        setPhase("queued");
        yield reportPhase("queued", {
          position: initialQueue.position,
          queueSize: initialQueue.queueSize,
          serverOnline: initialQueue.serverOnline,
          serverMax: initialQueue.serverMax
        });
        const deadline = Date.now() + normalizedConfig.queueTimeoutMs;
        let latestQueue = initialQueue;
        while (Date.now() < deadline) {
          logger(`queue_wait position=${(_a2 = latestQueue.position) != null ? _a2 : "unknown"} queueSize=${(_b2 = latestQueue.queueSize) != null ? _b2 : "unknown"}`);
          yield sleep(normalizedConfig.queuePollIntervalMs);
          latestQueue = yield http2.get(`/queue/status/${encodeURIComponent(initialQueue.queueId)}`, { auth });
          state.queue = latestQueue;
          if (latestQueue.status === "reserved" && latestQueue.reservationToken) {
            logger(`queue_reserved queueId=${latestQueue.queueId}`);
            return latestQueue;
          }
          if (latestQueue.status !== "queued") {
            throw new Error(`queue became ${latestQueue.status}`);
          }
        }
        throw new Error(`queue timed out after ${normalizedConfig.queueTimeoutMs}ms`);
      });
    }
    function joinResolvedCharacter(_0, _1) {
      return __async(this, arguments, function* (auth, character, details = {}) {
        state.character = character;
        yield createInGamePlaySession(auth, character);
        setPhase("joining_queue");
        yield reportPhase("joining_queue", details);
        const queue = preparedQueue(auth, character) || (yield waitForQueueReservation(
          auth,
          yield http2.post("/queue/join", {
            characterId: character.id,
            serverId: normalizedConfig.serverId
          }, { auth })
        ));
        state.queue = queue;
        setPhase("connecting_relay");
        yield reportPhase("connecting_relay", {
          relayHost: normalizedConfig.relayHost,
          relayPort: normalizedConfig.relayPort
        });
        yield relay.createClient(normalizedConfig.relayHost, normalizedConfig.relayPort);
        markRelayConnectionStarted();
        state.hello = buildHelloPacket({
          config: normalizedConfig,
          auth,
          character,
          queue,
          position: getPosition()
        });
        state.position = publicPositionFromPacket(state.hello);
        if (normalizedConfig.waitForRelayAccepted) {
          logger("waiting_for_relay_connection_accepted");
        } else {
          yield sendHelloPacket();
        }
        return {
          auth,
          character,
          queue,
          hello: state.hello
        };
      });
    }
    function handleRelayPacket(packetType, jsonContent, error) {
      var _a2, _b2, _c, _d, _e;
      let rawMessage = null;
      let message = null;
      let parseError = null;
      if (jsonContent) {
        try {
          rawMessage = parseRelayJsonContent(jsonContent);
          message = unwrapRelayMessage(rawMessage);
        } catch (caught) {
          parseError = caught;
        }
      }
      try {
        const maybePromise = onRelayPacket(summarizeRelayPacket({
          packetType,
          jsonContent,
          error,
          rawMessage,
          message,
          parseError
        }));
        if (maybePromise && typeof maybePromise.catch === "function") {
          maybePromise.catch((caught) => logger(`relay diagnostic failed: ${caught.message || String(caught)}`));
        }
      } catch (caught) {
        logger(`relay diagnostic failed: ${caught.message || String(caught)}`);
      }
      if (error) {
        state.lastError = error;
        setPhase("error");
        void reportPhase("error", { error });
        throw new Error(error);
      }
      if (packetType === "connectionAccepted") {
        state.relayAcceptedFallbackSent = true;
        sendSkyMpLoginPacket({ source: "connectionAccepted" });
        void sendHelloPacket({ source: "connectionAccepted" });
        if (!jsonContent) {
          return null;
        }
      }
      if (!jsonContent) {
        return null;
      }
      if (parseError) {
        const parseMessage = parseError instanceof Error ? parseError.message : String(parseError);
        state.lastError = parseMessage;
        setPhase("error");
        void reportPhase("error", { error: parseMessage, packetType });
        throw new Error(parseMessage);
      }
      if (!message || typeof message !== "object") {
        return null;
      }
      if (message.type === "welcome") {
        if (((_a2 = message.character) == null ? void 0 : _a2.id) !== ((_b2 = state.character) == null ? void 0 : _b2.id)) {
          throw new Error("welcome character did not match requested character");
        }
        state.welcome = message;
        applyOwnerSnapshot(message, "welcome");
        state.recipes = optionalArray(message.recipes);
        state.jobBoard = optionalArray(message.jobBoard);
        state.noticeBoards = optionalArray(message.noticeBoards);
        state.noticeBoardPosts = optionalArray(message.noticeBoardPosts);
        state.courierBoard = optionalArray(message.courierBoard);
        state.wantedBoard = optionalArray(message.wantedBoard);
        state.jailTasks = optionalArray(message.jailTasks);
        state.medicalCalls = optionalArray(message.medicalCalls);
        state.businessListings = optionalArray(message.businessListings);
        state.businessOrders = optionalArray(message.businessOrders);
        state.storageAuctionEvents = optionalArray(message.storageAuctionEvents);
        state.storageAuctionLots = optionalArray(message.storageAuctionLots);
        state.propertySaleListings = optionalArray((_c = message.available) == null ? void 0 : _c.propertySaleListings);
        emitJobEvent({
          type: "job_board",
          boardCode: "",
          jobs: state.jobBoard,
          source: "welcome"
        });
        emitNoticeEvent({
          type: "notice_board_posts",
          boards: state.noticeBoards,
          posts: state.noticeBoardPosts,
          source: "welcome"
        });
        emitCourierEvent({
          type: "courier_deliveries",
          deliveries: state.courierBoard,
          source: "welcome"
        });
        emitLawEvent({
          type: "wanted_board",
          wanted: state.wantedBoard,
          source: "welcome"
        });
        emitLawEvent({
          type: "jail_tasks",
          tasks: state.jailTasks,
          source: "welcome"
        });
        emitInjuryEvent({
          type: "medical_calls",
          injuries: state.medicalCalls,
          source: "welcome"
        });
        emitBusinessEvent({
          type: "business_listings",
          listings: state.businessListings,
          source: "welcome"
        });
        emitBusinessEvent({
          type: "business_orders",
          orders: state.businessOrders,
          source: "welcome"
        });
        emitPropertyEvent({
          type: "storage_auction_events",
          events: state.storageAuctionEvents,
          source: "welcome"
        });
        emitPropertyEvent({
          type: "storage_auction_lots",
          lots: state.storageAuctionLots,
          source: "welcome"
        });
        emitPropertyEvent({
          type: "property_sale_listings",
          listings: state.propertySaleListings,
          source: "welcome"
        });
        applyNpcSpawnSnapshot(message.activeNpcSpawns, "welcome");
        applyResourceNodeSnapshot(message.resourceNodes, "welcome");
        state.peers = {};
        if (Array.isArray(message.peers)) {
          for (const peer of message.peers) {
            const normalizedPeer = normalizePeer(peer);
            state.peers[normalizedPeer.clientId] = normalizedPeer;
          }
        }
        setPhase("joined");
        void reportPhase("joined", { clientId: message.clientId });
        logger(`joined clientId=${message.clientId}`);
        emitPeerEvent({
          type: "snapshot",
          peers: Object.values(state.peers)
        });
      } else if (message.type === "player_joined") {
        const peer = normalizePeer(message.player);
        state.peers[peer.clientId] = peer;
        emitPeerEvent({
          type: "joined",
          clientId: peer.clientId,
          peer
        });
      } else if (message.type === "player_transform") {
        const peer = normalizePeer(message.player);
        state.peers[peer.clientId] = __spreadValues(__spreadValues({}, state.peers[peer.clientId] || {}), peer);
        emitPeerEvent({
          type: "transform",
          clientId: peer.clientId,
          peer: state.peers[peer.clientId]
        });
      } else if (message.type === "player_identity") {
        const peer = normalizePeer(message.player);
        state.peers[peer.clientId] = __spreadValues(__spreadValues({}, state.peers[peer.clientId] || {}), peer);
        emitPeerEvent({
          type: "identity",
          clientId: peer.clientId,
          peer: state.peers[peer.clientId]
        });
      } else if (message.type === "character_introduced") {
        const peer = normalizePeer(message.character);
        state.peers[peer.clientId] = __spreadValues(__spreadValues({}, state.peers[peer.clientId] || {}), peer);
        emitPeerEvent({
          type: "identity",
          clientId: peer.clientId,
          peer: state.peers[peer.clientId]
        });
      } else if (message.type === "character_introduce_result") {
        state.lastCharacterIntroduceResult = message;
      } else if (message.type === "character_inspect_result") {
        state.lastCharacterInspectResult = message.result || null;
        const peer = ((_d = message.result) == null ? void 0 : _d.target) ? normalizePeer(message.result.target) : null;
        if (peer == null ? void 0 : peer.clientId) {
          state.peers[peer.clientId] = __spreadValues(__spreadValues({}, state.peers[peer.clientId] || {}), peer);
          emitPeerEvent({
            type: peer.identityKnown ? "identity" : "inspect",
            clientId: peer.clientId,
            peer: state.peers[peer.clientId]
          });
        }
      } else if (message.type === "character_title_result") {
        state.lastCharacterTitleResult = message;
        const peer = message.target ? normalizePeer(message.target) : null;
        if (peer == null ? void 0 : peer.clientId) {
          state.peers[peer.clientId] = __spreadValues(__spreadValues({}, state.peers[peer.clientId] || {}), peer);
          emitPeerEvent({
            type: "identity",
            clientId: peer.clientId,
            peer: state.peers[peer.clientId]
          });
        }
      } else if (message.type === "player_left") {
        const clientId = assertText(message.clientId, "clientId");
        const peer = state.peers[clientId] || null;
        delete state.peers[clientId];
        emitPeerEvent({
          type: "left",
          clientId,
          peer
        });
      } else if (message.type === "voice_state") {
        const clientId = assertText(message.clientId, "voice_state.clientId");
        if (state.peers[clientId]) {
          state.peers[clientId] = __spreadProps(__spreadValues({}, state.peers[clientId]), {
            speaking: Boolean(message.speaking)
          });
        }
        emitPeerEvent({
          type: "voice_state",
          clientId,
          speaking: Boolean(message.speaking),
          peer: state.peers[clientId] || null
        });
      } else if (message.type === "owner_snapshot") {
        applyOwnerSnapshot(message, "owner_snapshot");
      } else if (message.type === "wallet_sync_result") {
        state.lastWalletSyncResult = message.result || null;
        state.lastWalletSyncError = null;
      } else if (message.type === "account_stipend_claim_result") {
        state.lastAccountStipendResult = message.result || null;
      } else if (message.type === "chat_message") {
        emitChatEvent({
          type: "chat_message",
          message: message.message || null
        });
      } else if (message.type === "staff_direct_message_sent" || message.type === "staff_direct_message_received") {
        emitChatEvent({
          type: message.type,
          message: message.message || null,
          peer: message.sender || message.target || null
        });
      } else if (message.type === "chat_denied") {
        const retryAfterSeconds = Number(message.retryAfterSeconds || 0);
        const resetAt = optionalText(message.resetAt);
        emitChatEvent(__spreadValues(__spreadValues({
          type: "chat_denied",
          reason: optionalText(message.reason, "chat denied"),
          mutedUntil: optionalText(message.mutedUntil)
        }, retryAfterSeconds > 0 ? { retryAfterSeconds } : {}), resetAt ? { resetAt } : {}));
      } else if (message.type === "trade_result") {
        emitTradeEvent({
          type: "trade_result",
          trade: message.trade
        });
      } else if (message.type === "trade_request_sent" || message.type === "trade_request_received") {
        state.lastTradeRequest = message;
        emitTradeEvent({
          type: message.type,
          request: message.request || null,
          peer: message.requester || message.target || null
        });
      } else if (message.type === "trade_offer_created" || message.type === "trade_offer_received") {
        emitTradeEvent({
          type: message.type,
          offer: message.offer || null,
          peer: message.seller || message.buyer || null
        });
      } else if (message.type === "trade_offer_accepted") {
        emitTradeEvent({
          type: "trade_offer_accepted",
          result: message.result || null
        });
      } else if (message.type === "craft_result") {
        emitCraftEvent({
          type: "craft_result",
          craft: message.craft
        });
      } else if (message.type === "spell_tome_learn_result") {
        emitSpellEvent({
          type: "spell_tome_learn_result",
          result: message.result || null
        });
      } else if (message.type === "profession_memberships") {
        emitProfessionEvent({
          type: "profession_memberships",
          memberships: optionalArray(message.memberships)
        });
      } else if (message.type === "profession_joined") {
        emitProfessionEvent({
          type: "profession_joined",
          membership: message.membership || null
        });
      } else if (message.type === "profession_invitations") {
        state.professionInvitations = optionalArray(message.invitations);
        emitProfessionEvent({
          type: "profession_invitations",
          status: optionalText(message.status, "active"),
          invitations: state.professionInvitations
        });
      } else if (message.type === "profession_invitation_created" || message.type === "profession_invitation_received") {
        upsertProfessionInvitation(message.invitation);
        emitProfessionEvent({
          type: message.type,
          invitation: message.invitation || null
        });
      } else if (message.type === "profession_invitation_accepted" || message.type === "profession_invitation_accepted_notice") {
        upsertProfessionInvitation(message.invitation);
        emitProfessionEvent({
          type: message.type,
          invitation: message.invitation || null,
          membership: message.membership || null,
          memberships: optionalArray(message.memberships)
        });
      } else if (message.type === "resource_node_snapshot") {
        applyResourceNodeSnapshot(message.nodes, optionalText(message.reason, "resource_node_snapshot"));
      } else if (message.type === "resource_node_updated") {
        const node = normalizeResourceNode(message.node);
        state.resourceNodes[node.code] = node;
        emitResourceEvent({
          type: "updated",
          nodeCode: node.code,
          node
        });
      } else if (message.type === "resource_gather_result") {
        const result = message.result || {};
        const node = result.node ? normalizeResourceNode(result.node) : null;
        if (node) {
          state.resourceNodes[node.code] = node;
        }
        emitResourceEvent({
          type: "resource_gather_result",
          result: node ? __spreadProps(__spreadValues({}, result), { node }) : result,
          node
        });
      } else if (message.type === "onboarding_tip_acknowledged") {
        emitOnboardingEvent({
          type: "onboarding_tip_acknowledged",
          result: message.result || null,
          onboarding: message.onboarding || null
        });
      } else if (message.type === "onboarding_portal_approved") {
        emitOnboardingEvent({
          type: "onboarding_portal_approved",
          result: message.result || null,
          onboarding: message.onboarding || null
        });
      } else if (message.type === "dungeon_encounter_started") {
        state.lastDungeonEncounter = message.result || null;
      } else if (message.type === "job_board") {
        state.jobBoard = optionalArray(message.jobs);
        emitJobEvent({
          type: "job_board",
          boardCode: optionalText(message.boardCode),
          jobs: state.jobBoard,
          source: "relay"
        });
      } else if (message.type === "notice_boards") {
        state.noticeBoards = optionalArray(message.boards);
        emitNoticeEvent({
          type: "notice_boards",
          boards: state.noticeBoards,
          source: "relay"
        });
      } else if (message.type === "notice_board_posts") {
        state.noticeBoardPosts = optionalArray(message.posts);
        emitNoticeEvent({
          type: "notice_board_posts",
          boardCode: optionalText(message.boardCode),
          posts: state.noticeBoardPosts,
          source: "relay"
        });
      } else if (message.type === "notice_board_post_created" || message.type === "notice_board_post_archived") {
        const result = message.result || {};
        state.noticeBoardPosts = optionalArray(result.posts);
        if (result.board && !state.noticeBoards.some((board) => board.code === result.board.code)) {
          state.noticeBoards = [...state.noticeBoards, result.board];
        } else if (result.board) {
          state.noticeBoards = state.noticeBoards.map((board) => board.code === result.board.code ? result.board : board);
        }
        emitNoticeEvent({
          type: message.type,
          result,
          source: "relay"
        });
      } else if (message.type === "notice_board_updated") {
        if (message.board) {
          state.noticeBoards = state.noticeBoards.some((board) => board.code === message.board.code) ? state.noticeBoards.map((board) => board.code === message.board.code ? message.board : board) : [...state.noticeBoards, message.board];
        }
        if (message.post) {
          state.noticeBoardPosts = [
            message.post,
            ...state.noticeBoardPosts.filter((post) => post.id !== message.post.id)
          ].filter((post) => post.status === "active" && post.expired !== true);
        }
        emitNoticeEvent({
          type: "notice_board_updated",
          action: optionalText(message.action),
          board: message.board || null,
          post: message.post || null,
          source: "relay"
        });
      } else if (message.type === "job_claim_result") {
        emitJobEvent({
          type: "job_claim_result",
          claim: message.claim
        });
      } else if (message.type === "job_complete_result") {
        emitJobEvent({
          type: "job_complete_result",
          result: message.result
        });
      } else if (message.type === "courier_deliveries") {
        state.courierBoard = optionalArray(message.deliveries);
        emitCourierEvent({
          type: "courier_deliveries",
          status: optionalText(message.status),
          deliveries: state.courierBoard,
          source: "relay"
        });
      } else if (message.type === "courier_delivery_created") {
        emitCourierEvent({
          type: "courier_delivery_created",
          result: message.result
        });
      } else if (message.type === "courier_delivery_claimed") {
        emitCourierEvent({
          type: "courier_delivery_claimed",
          result: message.result
        });
      } else if (message.type === "courier_delivery_completed") {
        emitCourierEvent({
          type: "courier_delivery_completed",
          result: message.result
        });
      } else if (message.type === "courier_delivery_updated") {
        emitCourierEvent({
          type: "courier_delivery_updated",
          action: optionalText(message.action),
          delivery: message.delivery
        });
      } else if (message.type === "courier_delivery_delivered") {
        emitCourierEvent({
          type: "courier_delivery_delivered",
          delivery: message.delivery
        });
      } else if (message.type === "mail_delivered") {
        emitCourierEvent({
          type: "mail_delivered",
          delivery: message.delivery
        });
      } else if (message.type === "wanted_board") {
        state.wantedBoard = optionalArray(message.wanted);
        emitLawEvent({
          type: "wanted_board",
          status: optionalText(message.status),
          hold: optionalText(message.hold),
          wanted: state.wantedBoard,
          source: "relay"
        });
      } else if (message.type === "crime_report_result") {
        emitLawEvent({
          type: "crime_report_result",
          report: message.report,
          wanted: optionalArray(message.wanted),
          evidence: optionalArray(message.evidence)
        });
      } else if (message.type === "character_search_result") {
        emitLawEvent({
          type: "character_search_result",
          result: message.result
        });
      } else if (message.type === "character_pickpocket_result" || message.type === "character_pickpocketed" || message.type === "character_pickpocket_recorded") {
        emitLawEvent({
          type: message.type,
          result: message.result || {
            pickpocket: message.pickpocket,
            thiefCharacter: message.thiefCharacter
          }
        });
      } else if (message.type === "crime_report_filed") {
        emitLawEvent({
          type: "crime_report_filed",
          report: message.report,
          wanted: optionalArray(message.wanted),
          evidence: optionalArray(message.evidence)
        });
      } else if (message.type === "character_contraband_seizure_result" || message.type === "character_contraband_seized" || message.type === "character_contraband_seizure_recorded") {
        emitLawEvent({
          type: message.type,
          result: message.result
        });
      } else if (message.type === "character_cuff_result") {
        emitLawEvent({
          type: "character_cuff_result",
          result: message.result
        });
      } else if (message.type === "character_arrest_result" || message.type === "character_arrested" || message.type === "character_arrest_recorded") {
        emitLawEvent({
          type: message.type,
          result: message.result,
          arrest: message.arrest,
          arrestedByCharacter: message.arrestedByCharacter
        });
      } else if (message.type === "jail_sentence_received") {
        emitLawEvent({
          type: "jail_sentence_received",
          sentence: message.sentence,
          wanted: message.wanted
        });
      } else if (message.type === "wanted_record_sentenced") {
        emitLawEvent({
          type: "wanted_record_sentenced",
          result: message.result,
          sentence: message.sentence,
          wanted: message.wanted
        });
      } else if (message.type === "injury_report_result") {
        emitInjuryEvent({
          type: "injury_report_result",
          injury: message.injury
        });
      } else if (message.type === "medical_calls") {
        state.medicalCalls = optionalArray(message.injuries);
        emitInjuryEvent({
          type: "medical_calls",
          status: optionalText(message.status),
          injuries: state.medicalCalls,
          source: "relay"
        });
      } else if (message.type === "medical_call_created") {
        emitInjuryEvent({
          type: "medical_call_created",
          injury: message.injury
        });
      } else if (message.type === "injury_treat_result") {
        emitInjuryEvent({
          type: "injury_treat_result",
          injury: message.injury
        });
      } else if (message.type === "injury_treated") {
        emitInjuryEvent({
          type: "injury_treated",
          injury: message.injury
        });
      } else if (message.type === "medical_call_closed") {
        emitInjuryEvent({
          type: "medical_call_closed",
          injury: message.injury
        });
      } else if (message.type === "business_orders") {
        state.businessOrders = optionalArray(message.orders);
        emitBusinessEvent({
          type: "business_orders",
          businessId: optionalText(message.businessId),
          status: optionalText(message.status),
          orders: state.businessOrders,
          source: "relay"
        });
      } else if (message.type === "business_order_fulfilled") {
        emitBusinessEvent({
          type: "business_order_fulfilled",
          result: message.result
        });
      } else if (message.type === "business_order_updated") {
        emitBusinessEvent({
          type: "business_order_updated",
          action: optionalText(message.action),
          order: message.order,
          business: message.business
        });
      } else if (message.type === "business_listings") {
        state.businessListings = optionalArray(message.listings);
        emitBusinessEvent({
          type: "business_listings",
          businessId: optionalText(message.businessId),
          status: optionalText(message.status),
          listings: state.businessListings,
          source: "relay"
        });
      } else if (message.type === "business_listing_bought") {
        emitBusinessEvent({
          type: "business_listing_bought",
          result: message.result
        });
      } else if (message.type === "business_listing_updated") {
        emitBusinessEvent({
          type: "business_listing_updated",
          action: optionalText(message.action),
          listing: message.listing,
          business: message.business
        });
      } else if (message.type === "property_rent_result") {
        emitPropertyEvent({
          type: "property_rent_result",
          property: message.property,
          access: message.access
        });
      } else if (message.type === "property_purchase_result") {
        emitPropertyEvent({
          type: "property_purchase_result",
          property: message.property,
          access: message.access,
          buyer: message.buyer
        });
      } else if (message.type === "property_purchased") {
        emitPropertyEvent({
          type: "property_purchased",
          property: message.property,
          buyerCharacterId: optionalText(message.buyerCharacterId)
        });
      } else if (message.type === "property_access_result") {
        emitPropertyEvent({
          type: "property_access_result",
          property: message.property,
          characterId: optionalText(message.characterId),
          allowed: Boolean(message.allowed),
          requiredRoles: optionalArray(message.requiredRoles),
          roles: optionalArray(message.roles)
        });
      } else if (message.type === "property_access_changed") {
        emitPropertyEvent({
          type: "property_access_changed",
          action: optionalText(message.action),
          property: message.property,
          access: message.access,
          controllerCharacterId: optionalText(message.controllerCharacterId),
          targetCharacterId: optionalText(message.targetCharacterId),
          role: optionalText(message.role)
        });
      } else if (message.type === "property_interact_result") {
        emitPropertyEvent({
          type: "property_interact_result",
          property: message.property,
          characterId: optionalText(message.characterId),
          allowed: Boolean(message.allowed),
          requiredRoles: optionalArray(message.requiredRoles),
          roles: optionalArray(message.roles),
          interaction: optionalText(message.interaction),
          target: optionalText(message.target),
          ledgerId: optionalText(message.ledgerId)
        });
      } else if (message.type === "property_storage") {
        emitPropertyEvent({
          type: "property_storage",
          property: message.property,
          characterId: optionalText(message.characterId),
          allowed: Boolean(message.allowed),
          requiredRoles: optionalArray(message.requiredRoles),
          roles: optionalArray(message.roles),
          storage: optionalArray(message.storage),
          storageLedger: optionalArray(message.storageLedger)
        });
      } else if (message.type === "property_storage_deposit_result" || message.type === "property_storage_withdraw_result") {
        emitPropertyEvent({
          type: message.type,
          property: message.property,
          access: message.access,
          storage: optionalArray(message.storage),
          storageLedger: optionalArray(message.storageLedger),
          character: message.character || null,
          inventory: optionalArray(message.inventory)
        });
      } else if (message.type === "property_storage_changed") {
        emitPropertyEvent({
          type: "property_storage_changed",
          action: optionalText(message.action),
          property: message.property,
          storage: optionalArray(message.storage),
          storageLedger: optionalArray(message.storageLedger),
          characterId: optionalText(message.characterId)
        });
      } else if (message.type === "property_sale_listings") {
        state.propertySaleListings = optionalArray(message.listings);
        emitPropertyEvent({
          type: "property_sale_listings",
          status: optionalText(message.status, "active"),
          propertyId: optionalText(message.propertyId),
          listings: state.propertySaleListings,
          source: "relay"
        });
      } else if (message.type === "property_sale_listing_created" || message.type === "property_sale_listing_updated") {
        updatePropertySaleListing(message.listing);
        emitPropertyEvent({
          type: message.type,
          action: optionalText(message.action, message.type === "property_sale_listing_created" ? "created" : ""),
          listing: message.listing,
          property: message.property || null,
          access: message.access || null
        });
      } else if (message.type === "property_sale_listing_cancelled" || message.type === "property_sale_listing_bought" || message.type === "property_sale_listing_sold") {
        if (Array.isArray(message.listings)) {
          state.propertySaleListings = message.listings;
        } else {
          updatePropertySaleListing(message.listing);
        }
        emitPropertyEvent({
          type: message.type,
          listing: message.listing,
          property: message.property || null,
          access: message.access || null,
          buyer: message.buyer || null,
          seller: message.seller || null,
          listings: optionalArray(message.listings)
        });
      } else if (message.type === "storage_auction_lots") {
        state.storageAuctionLots = optionalArray(message.lots);
        emitPropertyEvent({
          type: "storage_auction_lots",
          status: optionalText(message.status),
          propertyId: optionalText(message.propertyId),
          eventId: optionalText(message.eventId),
          lots: state.storageAuctionLots,
          source: "relay"
        });
      } else if (message.type === "storage_auction_events") {
        state.storageAuctionEvents = optionalArray(message.events);
        emitPropertyEvent({
          type: "storage_auction_events",
          status: optionalText(message.status),
          events: state.storageAuctionEvents,
          source: "relay"
        });
      } else if (message.type === "storage_auction_bid_result") {
        updateStorageAuctionLot(message.lot);
        emitPropertyEvent({
          type: "storage_auction_bid_result",
          lot: message.lot,
          bidder: message.bidder
        });
      } else if (message.type === "storage_auction_lot_updated") {
        updateStorageAuctionLot(message.lot);
        emitPropertyEvent({
          type: "storage_auction_lot_updated",
          action: optionalText(message.action),
          lot: message.lot,
          bidderCharacterId: optionalText(message.bidderCharacterId)
        });
      } else if (message.type === "property_charges") {
        state.propertyCharges = optionalArray(message.charges);
        emitPropertyEvent({
          type: "property_charges",
          property: message.property || null,
          access: message.access || null,
          characterId: optionalText(message.characterId),
          status: optionalText(message.status, "open"),
          chargeType: optionalText(message.chargeType),
          charges: state.propertyCharges,
          source: "relay"
        });
      } else if (message.type === "property_charge_pay_result" || message.type === "property_charge_paid") {
        const result = message.result || message;
        if (Array.isArray(result.charges)) {
          state.propertyCharges = result.charges;
        } else if ((_e = result.charge) == null ? void 0 : _e.id) {
          state.propertyCharges = state.propertyCharges.filter((charge) => charge.id !== result.charge.id);
        }
        emitPropertyEvent({
          type: message.type,
          result,
          property: result.property || null,
          charge: result.charge || null,
          charges: optionalArray(result.charges),
          recipient: result.recipient || null
        });
      } else if (message.type === "property_upgrades") {
        emitPropertyEvent({
          type: "property_upgrades",
          property: message.property,
          access: message.access,
          status: optionalText(message.status, "active"),
          upgrades: optionalArray(message.upgrades),
          source: "relay"
        });
      } else if (message.type === "property_upgrade_install_result" || message.type === "property_upgrade_retire_result") {
        const result = message.result || message;
        emitPropertyEvent({
          type: message.type,
          property: result.property || null,
          access: result.access || null,
          upgrade: result.upgrade || null,
          upgrades: optionalArray(result.upgrades),
          character: result.character || null
        });
      } else if (message.type === "property_upgrade_changed") {
        emitPropertyEvent({
          type: "property_upgrade_changed",
          action: optionalText(message.action),
          property: message.property,
          upgrade: message.upgrade,
          upgrades: optionalArray(message.upgrades),
          controllerCharacterId: optionalText(message.controllerCharacterId)
        });
      } else if (message.type === "property_locks") {
        emitPropertyEvent({
          type: "property_locks",
          property: message.property,
          access: message.access,
          locks: optionalArray(message.locks),
          keys: optionalArray(message.keys)
        });
      } else if (message.type === "property_lock_check_result") {
        emitPropertyEvent({
          type: "property_lock_check_result",
          property: message.property,
          characterId: optionalText(message.characterId),
          allowed: Boolean(message.allowed),
          reason: optionalText(message.reason),
          lock: message.lock,
          key: message.key || null
        });
      } else if (message.type === "property_lock_change_result" || message.type === "property_lock_state_result") {
        emitPropertyEvent({
          type: message.type,
          property: message.property,
          lock: message.lock,
          locks: optionalArray(message.locks),
          keys: optionalArray(message.keys),
          revokedKeys: Number(message.revokedKeys || 0),
          access: message.access
        });
      } else if (message.type === "property_lock_changed") {
        emitPropertyEvent({
          type: "property_lock_changed",
          action: optionalText(message.action),
          property: message.property,
          lock: message.lock,
          locks: optionalArray(message.locks),
          controllerCharacterId: optionalText(message.controllerCharacterId)
        });
      } else if (message.type === "property_key_issue_result" || message.type === "property_key_revoke_result") {
        emitPropertyEvent({
          type: message.type,
          property: message.property,
          lock: message.lock,
          key: message.key,
          keys: optionalArray(message.keys),
          materialCost: message.materialCost,
          access: message.access
        });
      } else if (message.type === "property_key_changed") {
        emitPropertyEvent({
          type: "property_key_changed",
          action: optionalText(message.action),
          property: message.property,
          lock: message.lock,
          key: message.key
        });
      } else if (message.type === "npc_spawn_created") {
        applyNpcSpawn(message.spawn, "created", {
          actorClientId: optionalText(message.actorClientId)
        });
      } else if (message.type === "npc_spawn_despawned") {
        applyNpcSpawn(message.spawn || { id: message.spawnId, status: "despawned" }, "despawned", {
          actorClientId: optionalText(message.actorClientId)
        });
      } else if (message.type === "npc_spawn_snapshot") {
        applyNpcSpawnSnapshot(message.spawns, optionalText(message.reason, "npc_spawn_snapshot"));
      } else if (message.type === "spawn_report") {
        const spawn = message.spawn || {
          id: message.spawnId,
          status: message.status
        };
        applyNpcSpawn(spawn, "reported", {
          reporterClientId: optionalText(message.reporterClientId),
          status: optionalText(message.status),
          loot: message.loot || { granted: [] }
        });
      } else if (message.type === "error") {
        state.lastError = message.error || "relay error";
        if (state.phase === "joined") {
          state.lastRelayActionError = {
            error: state.lastError,
            correlationId: optionalText(message.correlationId),
            receivedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          logger(`relay action error: ${state.lastError}`);
          return message;
        }
        setPhase("error");
        void reportPhase("error", { error: state.lastError });
        throw new Error(state.lastError);
      }
      return message;
    }
    function sendTransform(nowMs = Date.now()) {
      if (state.phase !== "joined") {
        return false;
      }
      const transform = buildTransformPacket(getPosition());
      relay.send(transform, false);
      state.position = publicPositionFromPacket(transform);
      state.lastTransformSentAt = nowMs;
      return true;
    }
    function sendTransformIfDue(nowMs = Date.now()) {
      if (state.phase !== "joined") {
        return false;
      }
      if (state.lastTransformSentAt !== null && nowMs - state.lastTransformSentAt < normalizedConfig.transformIntervalMs) {
        return false;
      }
      return sendTransform(nowMs);
    }
    function sendVoiceState(speaking, nowMs = Date.now()) {
      if (state.phase !== "joined") {
        return false;
      }
      state.speaking = Boolean(speaking);
      relay.send({
        type: "voice_state",
        speaking: state.speaking
      }, true);
      state.lastVoiceStateSentAt = nowMs;
      return true;
    }
    function sendVoiceStateIfChanged(speaking, nowMs = Date.now()) {
      const nextSpeaking = Boolean(speaking);
      if (state.phase !== "joined" || state.speaking === nextSpeaking) {
        return false;
      }
      return sendVoiceState(nextSpeaking, nowMs);
    }
    function requestOwnerSnapshot() {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "owner_snapshot_request"
      }, true);
      return true;
    }
    function introduceToPeer(clientId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "character_introduce",
        targetClientId: assertText(clientId, "clientId")
      }, true);
      return true;
    }
    function inspectPeer(clientId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "character_inspect",
        targetClientId: assertText(clientId, "clientId")
      }, true);
      return true;
    }
    function requestTradeWithPeer(clientId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "trade_request",
        targetClientId: assertText(clientId, "clientId")
      }, true);
      return true;
    }
    function sendChat(channel, text5) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "chat",
        channel: optionalText(channel, "local"),
        text: assertText(text5, "text")
      }, true);
      return true;
    }
    function sendStaffDirectMessage(targetClientId, text5) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "staff_direct_message",
        targetClientId: assertText(targetClientId, "targetClientId"),
        text: assertText(text5, "text")
      }, true);
      return true;
    }
    function setCharacterTitle(targetClientId, title, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const packet = {
        type: "character_title_set",
        targetClientId: assertText(targetClientId, "targetClientId")
      };
      if (options.clear === true) {
        packet.clear = true;
      } else {
        packet.title = assertText(title, "title");
        packet.visibility = optionalText(options.visibility, "public");
      }
      relay.send(packet, true);
      return true;
    }
    function sendRpExpression(kind, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const normalizedKind = assertText(kind, "kind").toLowerCase();
      const packet = {
        type: "rp_expression",
        kind: normalizedKind
      };
      if (normalizedKind === "roll") {
        if (options.expression !== void 0 && options.expression !== null && options.expression !== "") {
          packet.expression = assertText(options.expression, "expression");
        } else {
          if (options.dice !== void 0) {
            packet.dice = Number(options.dice);
          }
          if (options.sides !== void 0) {
            packet.sides = Number(options.sides);
          }
          if (options.modifier !== void 0) {
            packet.modifier = Number(options.modifier);
          }
        }
      } else {
        packet.text = assertText(options.text, "text");
      }
      relay.send(packet, true);
      return true;
    }
    function rollDice(expression = "1d20") {
      return sendRpExpression("roll", { expression });
    }
    function syncWalletGold(gold, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      if (!Number.isInteger(gold) || gold < 0 || gold > 2147483647) {
        throw new Error("gold must be an integer from 0 to 2147483647");
      }
      relay.send({
        type: "wallet_sync",
        gold,
        source: optionalText(options.source, "skyrim_gold"),
        reason: optionalText(options.reason, "Skyrim gold sync")
      }, true);
      state.lastWalletSyncSentAt = Date.now();
      state.lastWalletSyncGold = gold;
      return true;
    }
    function claimAccountStipend() {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "account_stipend_claim"
      }, true);
      return true;
    }
    function acknowledgeOnboardingTip(tipCode, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "onboarding_tip_acknowledge",
        tipCode: assertText(tipCode, "tipCode")
      };
      if (options.source !== void 0 && options.source !== null) {
        message.source = assertText(options.source, "source");
      }
      relay.send(message, true);
      return true;
    }
    function requestOnboardingPortal(destinationCode, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "onboarding_portal_approve",
        destinationCode: assertText(destinationCode, "destinationCode")
      };
      if (options.source !== void 0 && options.source !== null) {
        message.source = assertText(options.source, "source");
      }
      if (options.portalCode !== void 0 && options.portalCode !== null) {
        message.portalCode = assertText(options.portalCode, "portalCode");
      }
      relay.send(message, true);
      return true;
    }
    function approveOnboardingPortal(destinationCode) {
      return __async(this, null, function* () {
        var _a2, _b2, _c;
        if (state.phase !== "joined") {
          return false;
        }
        if (!((_a2 = state.auth) == null ? void 0 : _a2.accountId) || !((_b2 = state.auth) == null ? void 0 : _b2.sessionToken)) {
          throw new Error("auth is required for onboarding portal approval");
        }
        const characterId = optionalText((_c = state.character) == null ? void 0 : _c.id);
        if (!characterId) {
          throw new Error("character is required for onboarding portal approval");
        }
        try {
          const result = yield http2.post(`/onboarding/${encodeURIComponent(characterId)}/portal`, {
            destinationCode: assertText(destinationCode, "destinationCode")
          }, { auth: state.auth });
          state.lastOnboardingEvent = result.onboarding || result;
          state.lastOnboardingEventError = null;
          return result;
        } catch (error) {
          state.lastOnboardingEventError = (error == null ? void 0 : error.message) || String(error);
          throw error;
        }
      });
    }
    function sellInventory({ buyerCode, items }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "trade_sell",
        buyerCode: assertText(buyerCode, "buyerCode"),
        items: normalizeTradeItems(items)
      }, true);
      return true;
    }
    function createTradeOffer({ buyerCharacterId, items, price = 0, ttlSeconds = 300 }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "trade_offer",
        buyerCharacterId: assertText(buyerCharacterId, "buyerCharacterId"),
        price: Number(price || 0),
        ttlSeconds: Number(ttlSeconds || 300),
        items: normalizeTradeItems(items)
      }, true);
      return true;
    }
    function acceptTradeOffer(offerId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "trade_offer_accept",
        offerId: assertText(offerId, "offerId")
      }, true);
      return true;
    }
    function craftRecipe(recipeCode2, quantity = 1) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "craft_recipe",
        recipeCode: assertText(recipeCode2, "recipeCode"),
        quantity: Number(quantity || 1)
      }, true);
      return true;
    }
    function learnSpellTome(itemCode) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "spell_tome_learn",
        itemCode: assertText(itemCode, "itemCode")
      }, true);
      return true;
    }
    function requestProfessionMemberships() {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "profession_memberships_request"
      }, true);
      return true;
    }
    function joinProfession(professionCode2, notes = "") {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send(__spreadValues({
        type: "profession_join",
        professionCode: assertText(professionCode2, "professionCode")
      }, notes ? { notes: optionalText(notes) } : {}), true);
      return true;
    }
    function requestProfessionInvitations(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "profession_invitations_request"
      };
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      if (filters.includeExpired !== void 0 && filters.includeExpired !== null) {
        message.includeExpired = Boolean(filters.includeExpired);
      }
      relay.send(message, true);
      return true;
    }
    function createProfessionInvitation({ professionCode: professionCode2, targetCharacterId, expiresInDays = 7, notes = "" }) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "profession_invitation_create",
        professionCode: assertText(professionCode2, "professionCode"),
        targetCharacterId: assertText(targetCharacterId, "targetCharacterId"),
        expiresInDays: Number(expiresInDays || 7)
      };
      if (notes) {
        message.notes = optionalText(notes);
      }
      relay.send(message, true);
      return true;
    }
    function acceptProfessionInvitation(invitationId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "profession_invitation_accept",
        invitationId: assertText(invitationId, "invitationId")
      }, true);
      return true;
    }
    function requestResourceNodes(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "resource_nodes_request"
      };
      if (filters.worldspace !== void 0 && filters.worldspace !== null) {
        message.worldspace = assertText(filters.worldspace, "worldspace");
      }
      if (filters.cell !== void 0 && filters.cell !== null) {
        message.cell = assertText(filters.cell, "cell");
      }
      if (filters.resourceType !== void 0 && filters.resourceType !== null) {
        message.resourceType = assertText(filters.resourceType, "resourceType");
      }
      relay.send(message, true);
      return true;
    }
    function gatherResourceNode(nodeCode) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "resource_gather",
        nodeCode: assertText(nodeCode, "nodeCode")
      }, true);
      return true;
    }
    function startDungeonEncounter(encounterCode) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "dungeon_encounter_start",
        encounterCode: assertText(encounterCode, "encounterCode")
      }, true);
      return true;
    }
    function requestJobBoard(boardCode = null) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send(__spreadValues({
        type: "job_board_request"
      }, boardCode ? { boardCode: assertText(boardCode, "boardCode") } : {}), true);
      return true;
    }
    function requestNoticeBoards(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = { type: "notice_boards_request" };
      if (filters.town !== void 0 && filters.town !== null) {
        message.town = assertText(filters.town, "town");
      }
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      relay.send(message, true);
      return true;
    }
    function requestNoticeBoardPosts(boardCode = null, filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = __spreadValues({
        type: "notice_board_posts_request"
      }, boardCode ? { boardCode: assertText(boardCode, "boardCode") } : {});
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      if (filters.includeExpired !== void 0 && filters.includeExpired !== null) {
        message.includeExpired = Boolean(filters.includeExpired);
      }
      relay.send(message, true);
      return true;
    }
    function createNoticeBoardPost({ boardCode, title, body, category = "notice", expiresInDays = 7 }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "notice_board_post_create",
        boardCode: assertText(boardCode, "boardCode"),
        title: assertText(title, "title"),
        body: assertText(body, "body"),
        category: optionalText(category, "notice"),
        expiresInDays: Number(expiresInDays || 7)
      }, true);
      return true;
    }
    function archiveNoticeBoardPost(postId, reason = "Archived notice") {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "notice_board_post_archive",
        postId: assertText(postId, "postId"),
        reason: optionalText(reason, "Archived notice")
      }, true);
      return true;
    }
    function claimJob(jobCode) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "job_claim",
        jobCode: assertText(jobCode, "jobCode")
      }, true);
      return true;
    }
    function completeJob(claimId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "job_complete",
        claimId: assertText(claimId, "claimId")
      }, true);
      return true;
    }
    function requestCourierDeliveries(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "courier_deliveries_request"
      };
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      if (filters.recipientCharacterId !== void 0 && filters.recipientCharacterId !== null) {
        message.recipientCharacterId = assertText(filters.recipientCharacterId, "recipientCharacterId");
      }
      if (filters.courierCharacterId !== void 0 && filters.courierCharacterId !== null) {
        message.courierCharacterId = assertText(filters.courierCharacterId, "courierCharacterId");
      }
      relay.send(message, true);
      return true;
    }
    function claimCourierDelivery(deliveryId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "courier_delivery_claim",
        deliveryId: assertText(deliveryId, "deliveryId")
      }, true);
      return true;
    }
    function completeCourierDelivery(deliveryId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "courier_delivery_complete",
        deliveryId: assertText(deliveryId, "deliveryId")
      }, true);
      return true;
    }
    function requestWantedBoard(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "wanted_board_request"
      };
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      if (filters.hold !== void 0 && filters.hold !== null) {
        message.hold = assertText(filters.hold, "hold");
      }
      relay.send(message, true);
      return true;
    }
    function reportCrime(report = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "crime_report",
        crimeType: optionalText(report.crimeType, "disturbance"),
        severity: optionalText(report.severity, "minor"),
        hold: optionalText(report.hold, "Whiterun"),
        description: optionalText(report.description, "Player filed a local report."),
        evidence: optionalArray(report.evidence)
      };
      if (report.suspectCharacterId !== void 0 && report.suspectCharacterId !== null) {
        message.suspectCharacterId = assertText(report.suspectCharacterId, "suspectCharacterId");
      }
      relay.send(message, true);
      return true;
    }
    function searchCharacter(characterId, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "character_search",
        searchedCharacterId: assertText(characterId, "characterId"),
        hold: optionalText(options.hold, "Whiterun"),
        reason: optionalText(options.reason, "Guard context search")
      }, true);
      return true;
    }
    function pickpocketCharacter(characterId, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "character_pickpocket",
        targetCharacterId: assertText(characterId, "characterId"),
        hold: optionalText(options.hold, "Whiterun")
      }, true);
      return true;
    }
    function cuffCharacter(characterId, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "character_cuff",
        characterId: assertText(characterId, "characterId"),
        hold: optionalText(options.hold, "Whiterun"),
        reason: optionalText(options.reason, "Guard context cuff")
      };
      if (options.wantedId !== void 0 && options.wantedId !== null) {
        message.wantedId = assertText(options.wantedId, "wantedId");
      }
      if (options.searchId !== void 0 && options.searchId !== null) {
        message.searchId = assertText(options.searchId, "searchId");
      }
      relay.send(message, true);
      return true;
    }
    function arrestCharacter(characterId, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "character_arrest",
        characterId: assertText(characterId, "characterId"),
        hold: optionalText(options.hold, "Whiterun"),
        reason: optionalText(options.reason, "Guard context arrest")
      };
      if (options.wantedId !== void 0 && options.wantedId !== null) {
        message.wantedId = assertText(options.wantedId, "wantedId");
      }
      if (options.cuffId !== void 0 && options.cuffId !== null) {
        message.cuffId = assertText(options.cuffId, "cuffId");
      }
      if (options.searchId !== void 0 && options.searchId !== null) {
        message.searchId = assertText(options.searchId, "searchId");
      }
      relay.send(message, true);
      return true;
    }
    function seizeCharacterContraband(searchId, items = [], options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "character_contraband_seize",
        searchId: assertText(searchId, "searchId"),
        items: optionalArray(items),
        reason: optionalText(options.reason, "Contraband seized from character inventory")
      }, true);
      return true;
    }
    function reportInjury(report = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "injury_report",
        injuryType: optionalText(report.injuryType, "field_injury"),
        severity: optionalText(report.severity, "serious"),
        description: optionalText(report.description, "Player requested healer support.")
      }, true);
      return true;
    }
    function requestMedicalCalls(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "medical_calls_request"
      };
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      relay.send(message, true);
      return true;
    }
    function treatInjury(injuryId, options = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "injury_treat",
        injuryId: assertText(injuryId, "injuryId"),
        notes: optionalText(options.notes, "Treated from in-game medical context.")
      }, true);
      return true;
    }
    function requestBusinessOrders(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "business_orders_request"
      };
      if (filters.businessId !== void 0 && filters.businessId !== null) {
        message.businessId = assertText(filters.businessId, "businessId");
      }
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      relay.send(message, true);
      return true;
    }
    function fulfillBusinessOrder(orderId, quantity = 1) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "business_order_fulfill",
        orderId: assertText(orderId, "orderId"),
        quantity: Number(quantity || 1)
      }, true);
      return true;
    }
    function requestBusinessListings(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "business_listings_request"
      };
      if (filters.businessId !== void 0 && filters.businessId !== null) {
        message.businessId = assertText(filters.businessId, "businessId");
      }
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      relay.send(message, true);
      return true;
    }
    function buyBusinessListing(listingId, quantity = 1) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "business_listing_buy",
        listingId: assertText(listingId, "listingId"),
        quantity: Number(quantity || 1)
      }, true);
      return true;
    }
    function queryPath(path, params = {}) {
      const pairs = Object.entries(params).filter((entry) => entry[1] !== void 0 && entry[1] !== null && entry[1] !== "").map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      return pairs.length > 0 ? `${path}?${pairs.join("&")}` : path;
    }
    function currentCharacterId() {
      var _a2, _b2, _c;
      return optionalText(((_a2 = state.character) == null ? void 0 : _a2.id) || ((_c = (_b2 = state.ownerSnapshot) == null ? void 0 : _b2.character) == null ? void 0 : _c.id));
    }
    function payGuildDue(dueId) {
      return __async(this, null, function* () {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const payerCharacterId = currentCharacterId();
        if (!payerCharacterId) {
          return false;
        }
        const cleanDueId = assertText(dueId, "dueId");
        const result = yield http2.post(`/guild-dues/${encodeURIComponent(cleanDueId)}/pay`, {
          payerCharacterId
        }, { auth: state.auth });
        state.lastGuildEvent = {
          type: "guild_due_paid",
          result
        };
        state.lastGuildEventError = null;
        return true;
      });
    }
    function claimGuildContract(contractId) {
      return __async(this, null, function* () {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const characterId = currentCharacterId();
        if (!characterId) {
          return false;
        }
        const cleanContractId = assertText(contractId, "contractId");
        const result = yield http2.post(`/guild-contracts/${encodeURIComponent(cleanContractId)}/claim`, {
          characterId
        }, { auth: state.auth });
        state.lastGuildEvent = {
          type: "guild_contract_claimed",
          result
        };
        state.lastGuildEventError = null;
        return true;
      });
    }
    function completeGuildContract(claimId) {
      return __async(this, null, function* () {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const characterId = currentCharacterId();
        if (!characterId) {
          return false;
        }
        const cleanClaimId = assertText(claimId, "claimId");
        const result = yield http2.post(`/guild-contract-claims/${encodeURIComponent(cleanClaimId)}/complete`, {
          characterId
        }, { auth: state.auth });
        state.lastGuildEvent = {
          type: "guild_contract_completed",
          result
        };
        state.lastGuildEventError = null;
        return true;
      });
    }
    function upsertGuildMember(_0) {
      return __async(this, arguments, function* ({
        guildId,
        targetCharacterId,
        rankCode = "recruit",
        title = null,
        permissions = null,
        notes = ""
      }) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const controllerCharacterId = currentCharacterId();
        if (!controllerCharacterId) {
          return false;
        }
        const cleanGuildId = assertText(guildId, "guildId");
        const body = {
          controllerCharacterId,
          targetCharacterId: assertText(targetCharacterId, "targetCharacterId"),
          rankCode: assertText(rankCode, "rankCode"),
          notes: optionalText(notes, "")
        };
        if (title !== null && title !== void 0 && title !== "") {
          body.title = optionalText(title);
        }
        if (permissions && typeof permissions === "object") {
          body.permissions = permissions;
        }
        const result = yield http2.post(`/guilds/${encodeURIComponent(cleanGuildId)}/members`, body, { auth: state.auth });
        state.lastGuildEvent = {
          type: "guild_member_upserted",
          result
        };
        state.lastGuildEventError = null;
        return true;
      });
    }
    function revokeGuildMember(_0) {
      return __async(this, arguments, function* ({ guildId, targetCharacterId, reason = "" }) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const controllerCharacterId = currentCharacterId();
        if (!controllerCharacterId) {
          return false;
        }
        const cleanGuildId = assertText(guildId, "guildId");
        const cleanTargetCharacterId = assertText(targetCharacterId, "targetCharacterId");
        const result = yield http2.post(`/guilds/${encodeURIComponent(cleanGuildId)}/members/${encodeURIComponent(cleanTargetCharacterId)}/revoke`, {
          controllerCharacterId,
          reason: optionalText(reason, "")
        }, { auth: state.auth });
        state.lastGuildEvent = {
          type: "guild_member_revoked",
          result
        };
        state.lastGuildEventError = null;
        return true;
      });
    }
    function requestJailTasks() {
      return __async(this, arguments, function* (filters = {}) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const characterId = filters.characterId || currentCharacterId();
        if (!characterId) {
          return false;
        }
        const result = yield http2.get(queryPath("/crime/jail-sentence-tasks", {
          characterId,
          sentenceId: filters.sentenceId || null,
          status: filters.status || "assigned"
        }), { auth: state.auth });
        state.jailTasks = optionalArray(result.tasks);
        state.lastJailEvent = {
          type: "jail_tasks",
          tasks: state.jailTasks
        };
        state.lastJailEventError = null;
        return true;
      });
    }
    function completeJailTask(_0) {
      return __async(this, arguments, function* (taskId, options = {}) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const completedByCharacterId = options.completedByCharacterId || currentCharacterId();
        if (!completedByCharacterId) {
          return false;
        }
        const cleanTaskId = assertText(taskId, "taskId");
        const result = yield http2.post(`/crime/jail-sentence-tasks/${encodeURIComponent(cleanTaskId)}/complete`, {
          completedByCharacterId,
          notes: optionalText(options.notes, "Completed from in-game jail marker.")
        }, { auth: state.auth });
        state.lastJailEvent = {
          type: "jail_task_completed",
          result
        };
        state.lastJailEventError = null;
        state.jailTasks = state.jailTasks.filter((task) => task.id !== cleanTaskId);
        return true;
      });
    }
    function requestTaxiRoutes() {
      return __async(this, arguments, function* (filters = {}) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const result = yield http2.get(queryPath("/transport/routes", {
          status: filters.status || "active"
        }), { auth: state.auth });
        state.taxiRoutes = optionalArray(result.routes);
        state.lastTaxiEvent = {
          type: "taxi_routes",
          routes: state.taxiRoutes
        };
        state.lastTaxiEventError = null;
        return true;
      });
    }
    function requestTaxiContracts() {
      return __async(this, arguments, function* (filters = {}) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const result = yield http2.get(queryPath("/transport/taxi-contracts", {
          status: filters.status || "open",
          passengerCharacterId: filters.passengerCharacterId || null,
          driverCharacterId: filters.driverCharacterId || null,
          routeCode: filters.routeCode || null
        }), { auth: state.auth });
        state.taxiContracts = optionalArray(result.contracts);
        state.lastTaxiEvent = {
          type: "taxi_contracts",
          contracts: state.taxiContracts
        };
        state.lastTaxiEventError = null;
        return true;
      });
    }
    function createTaxiContract(_0) {
      return __async(this, arguments, function* ({ routeCode, fareGold = null, pickupNote = "", destinationNote = "" }) {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const passengerCharacterId = currentCharacterId();
        if (!passengerCharacterId) {
          return false;
        }
        const result = yield http2.post("/transport/taxi-contracts", __spreadProps(__spreadValues({
          passengerCharacterId,
          routeCode: assertText(routeCode, "routeCode")
        }, fareGold === null || fareGold === void 0 ? {} : { fareGold: Number(fareGold) }), {
          pickupNote: optionalText(pickupNote),
          destinationNote: optionalText(destinationNote)
        }), { auth: state.auth });
        state.lastTaxiEvent = {
          type: "taxi_contract_created",
          result
        };
        state.lastTaxiEventError = null;
        if (result.contract) {
          state.taxiContracts = [
            result.contract,
            ...state.taxiContracts.filter((contract) => contract.id !== result.contract.id)
          ];
        }
        return true;
      });
    }
    function claimTaxiContract(contractId) {
      return __async(this, null, function* () {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const driverCharacterId = currentCharacterId();
        if (!driverCharacterId) {
          return false;
        }
        const cleanContractId = assertText(contractId, "contractId");
        const result = yield http2.post(`/transport/taxi-contracts/${encodeURIComponent(cleanContractId)}/claim`, {
          driverCharacterId
        }, { auth: state.auth });
        state.lastTaxiEvent = {
          type: "taxi_contract_claimed",
          result
        };
        state.lastTaxiEventError = null;
        if (result.contract) {
          state.taxiContracts = [
            result.contract,
            ...state.taxiContracts.filter((contract) => contract.id !== result.contract.id)
          ];
        }
        return true;
      });
    }
    function completeTaxiContract(contractId) {
      return __async(this, null, function* () {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const driverCharacterId = currentCharacterId();
        if (!driverCharacterId) {
          return false;
        }
        const cleanContractId = assertText(contractId, "contractId");
        const result = yield http2.post(`/transport/taxi-contracts/${encodeURIComponent(cleanContractId)}/complete`, {
          driverCharacterId
        }, { auth: state.auth });
        state.lastTaxiEvent = {
          type: "taxi_contract_completed",
          result
        };
        state.lastTaxiEventError = null;
        if (result.contract) {
          state.taxiContracts = state.taxiContracts.filter((contract) => contract.id !== result.contract.id);
        }
        return true;
      });
    }
    function requestProperties() {
      return __async(this, null, function* () {
        if (state.phase !== "joined" || !state.auth) {
          return false;
        }
        const result = yield http2.get("/properties", { auth: state.auth });
        state.propertyListings = optionalArray(result.properties);
        emitPropertyEvent({
          type: "property_list",
          properties: state.propertyListings,
          source: "backend"
        });
        return true;
      });
    }
    function rentProperty(propertyId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_rent",
        propertyId: assertText(propertyId, "propertyId")
      }, true);
      return true;
    }
    function purchaseProperty(propertyId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_purchase",
        propertyId: assertText(propertyId, "propertyId")
      }, true);
      return true;
    }
    function requestPropertySaleListings(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "property_sale_listings_request",
        status: optionalText(filters.status, "active")
      };
      if (filters.propertyId !== void 0 && filters.propertyId !== null && filters.propertyId !== "") {
        message.propertyId = assertText(filters.propertyId, "propertyId");
      }
      relay.send(message, true);
      return true;
    }
    function createPropertySaleListing({
      propertyId,
      askingPrice,
      buyerCharacterId = null,
      expiresAt = null
    }) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "property_sale_listing_create",
        propertyId: assertText(propertyId, "propertyId"),
        askingPrice: Number(askingPrice || 0)
      };
      if (buyerCharacterId !== null && buyerCharacterId !== void 0 && buyerCharacterId !== "") {
        message.buyerCharacterId = assertText(buyerCharacterId, "buyerCharacterId");
      }
      if (expiresAt !== null && expiresAt !== void 0 && expiresAt !== "") {
        message.expiresAt = assertText(expiresAt, "expiresAt");
      }
      relay.send(message, true);
      return true;
    }
    function cancelPropertySaleListing(listingId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_sale_listing_cancel",
        listingId: assertText(listingId, "listingId")
      }, true);
      return true;
    }
    function buyPropertySaleListing(listingId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_sale_listing_buy",
        listingId: assertText(listingId, "listingId")
      }, true);
      return true;
    }
    function checkPropertyAccess(propertyId, requiredRoles = []) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_access_check",
        propertyId: assertText(propertyId, "propertyId"),
        requiredRoles: optionalArray(requiredRoles)
      }, true);
      return true;
    }
    function grantPropertyAccess({ propertyId, targetCharacterId, role }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_access_grant",
        propertyId: assertText(propertyId, "propertyId"),
        targetCharacterId: assertText(targetCharacterId, "targetCharacterId"),
        role: assertText(role, "role")
      }, true);
      return true;
    }
    function revokePropertyAccess({ propertyId, targetCharacterId, role }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_access_revoke",
        propertyId: assertText(propertyId, "propertyId"),
        targetCharacterId: assertText(targetCharacterId, "targetCharacterId"),
        role: assertText(role, "role")
      }, true);
      return true;
    }
    function requestPropertyStorage(propertyId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_storage_request",
        propertyId: assertText(propertyId, "propertyId")
      }, true);
      return true;
    }
    function depositPropertyStorage({ propertyId, itemCode, quantity = 1 }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_storage_deposit",
        propertyId: assertText(propertyId, "propertyId"),
        itemCode: assertText(itemCode, "itemCode"),
        quantity: Number(quantity || 1)
      }, true);
      return true;
    }
    function withdrawPropertyStorage({ propertyId, itemCode, quantity = 1 }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_storage_withdraw",
        propertyId: assertText(propertyId, "propertyId"),
        itemCode: assertText(itemCode, "itemCode"),
        quantity: Number(quantity || 1)
      }, true);
      return true;
    }
    function requestStorageAuctionLots(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "storage_auction_lots_request"
      };
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      if (filters.propertyId !== void 0 && filters.propertyId !== null) {
        message.propertyId = assertText(filters.propertyId, "propertyId");
      }
      if (filters.eventId !== void 0 && filters.eventId !== null) {
        message.eventId = assertText(filters.eventId, "eventId");
      }
      if (filters.limit !== void 0 && filters.limit !== null) {
        message.limit = Number(filters.limit || 50);
      }
      relay.send(message, true);
      return true;
    }
    function requestStorageAuctionEvents(filters = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "storage_auction_events_request"
      };
      if (filters.status !== void 0 && filters.status !== null) {
        message.status = assertText(filters.status, "status");
      }
      if (filters.includeLots !== void 0 && filters.includeLots !== null) {
        message.includeLots = Boolean(filters.includeLots);
      }
      if (filters.limit !== void 0 && filters.limit !== null) {
        message.limit = Number(filters.limit || 50);
      }
      relay.send(message, true);
      return true;
    }
    function bidStorageAuctionLot(lotId, amount) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "storage_auction_bid",
        lotId: assertText(lotId, "lotId"),
        amount: Number(amount || 1)
      }, true);
      return true;
    }
    function requestPropertyCharges({ propertyId, status = "open", chargeType = null, includeAll = false } = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      const cleanPropertyId = optionalText(propertyId);
      if (!cleanPropertyId) {
        return false;
      }
      const message = {
        type: "property_charges_request",
        propertyId: cleanPropertyId,
        status: optionalText(status, "open")
      };
      if (chargeType !== null && chargeType !== void 0 && chargeType !== "") {
        message.chargeType = optionalText(chargeType);
      }
      if (includeAll !== void 0 && includeAll !== null) {
        message.includeAll = Boolean(includeAll);
      }
      relay.send(message, true);
      return true;
    }
    function payPropertyCharge(chargeId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_charge_pay",
        chargeId: assertText(chargeId, "chargeId")
      }, true);
      return true;
    }
    function requestPropertyUpgrades({ propertyId, status = "active" } = {}) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_upgrades_request",
        propertyId: assertText(propertyId, "propertyId"),
        status: optionalText(status, "active")
      }, true);
      return true;
    }
    function installPropertyUpgrade({
      propertyId,
      upgradeCode,
      displayName = null,
      category = "general",
      level = 1,
      cost = 0,
      notes = ""
    }) {
      if (state.phase !== "joined") {
        return false;
      }
      const cleanUpgradeCode = assertText(upgradeCode, "upgradeCode");
      relay.send({
        type: "property_upgrade_install",
        propertyId: assertText(propertyId, "propertyId"),
        upgradeCode: cleanUpgradeCode,
        displayName: optionalText(displayName, cleanUpgradeCode),
        category: optionalText(category, "general"),
        level: Number(level || 1),
        cost: Number(cost || 0),
        notes: optionalText(notes)
      }, true);
      return true;
    }
    function retirePropertyUpgrade({ propertyId, upgradeId, reason = "" }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_upgrade_retire",
        propertyId: assertText(propertyId, "propertyId"),
        upgradeId: assertText(upgradeId, "upgradeId"),
        reason: optionalText(reason)
      }, true);
      return true;
    }
    function requestPropertyLocks(propertyId) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_locks_request",
        propertyId: assertText(propertyId, "propertyId")
      }, true);
      return true;
    }
    function checkPropertyLock({ propertyId, targetCode }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_lock_check",
        propertyId: assertText(propertyId, "propertyId"),
        targetCode: assertText(targetCode, "targetCode")
      }, true);
      return true;
    }
    function changePropertyLock({ propertyId, targetCode, lockLevel = null, reason = "Changed lock" }) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "property_lock_change",
        propertyId: assertText(propertyId, "propertyId"),
        targetCode: assertText(targetCode, "targetCode"),
        reason: optionalText(reason, "Changed lock")
      };
      if (lockLevel !== null && lockLevel !== void 0) {
        message.lockLevel = Number(lockLevel);
      }
      relay.send(message, true);
      return true;
    }
    function issuePropertyKey({ propertyId, targetCode, targetCharacterId, label: label2 = null }) {
      if (state.phase !== "joined") {
        return false;
      }
      const message = {
        type: "property_key_issue",
        propertyId: assertText(propertyId, "propertyId"),
        targetCode: assertText(targetCode, "targetCode"),
        targetCharacterId: assertText(targetCharacterId, "targetCharacterId")
      };
      if (label2 !== null && label2 !== void 0 && label2 !== "") {
        message.label = optionalText(label2);
      }
      relay.send(message, true);
      return true;
    }
    function revokePropertyKey({ propertyId, keyId }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_key_revoke",
        propertyId: assertText(propertyId, "propertyId"),
        keyId: assertText(keyId, "keyId")
      }, true);
      return true;
    }
    function interactProperty({ propertyId, interaction, target = "", requiredRoles = [] }) {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "property_interact",
        propertyId: assertText(propertyId, "propertyId"),
        interaction: assertText(interaction, "interaction"),
        target: optionalText(target),
        requiredRoles: optionalArray(requiredRoles)
      }, true);
      return true;
    }
    function reportNpcSpawn(spawnId, status = "dead") {
      if (state.phase !== "joined") {
        return false;
      }
      relay.send({
        type: "spawn_report",
        spawnId: assertText(spawnId, "spawnId"),
        status: optionalText(status, "dead")
      }, true);
      return true;
    }
    return {
      state,
      connect() {
        return __async(this, null, function* () {
          try {
            const preparedConnectResult = connectPreparedReservation();
            if (preparedConnectResult) {
              return preparedConnectResult;
            }
            setPhase("authenticating");
            const auth = yield resolveAuth();
            state.auth = auth;
            yield reportPhase("authenticated");
            setPhase("selecting_character");
            yield reportPhase("selecting_character");
            const character = yield resolveCharacter(auth);
            if (!character) {
              logger("character_selection_required");
              return {
                auth,
                character: null,
                characterSlots: __spreadProps(__spreadValues({}, state.characterSlots), {
                  characters: [...state.characterSlots.characters]
                }),
                needsCharacterSelection: true
              };
            }
            return yield joinResolvedCharacter(auth, character);
          } catch (error) {
            const failedPhase = state.phase;
            const message = (error == null ? void 0 : error.message) || String(error);
            state.lastError = message;
            setPhase("error");
            yield reportPhase("error", {
              failedPhase,
              error: message
            });
            throw error;
          }
        });
      },
      refreshCharacterSlots() {
        return __async(this, null, function* () {
          try {
            setPhase("selecting_character");
            const auth = state.auth || (yield resolveAuth());
            state.auth = auth;
            yield reportPhase("selecting_character", { refresh: true });
            const characterSlots = yield ensureCharacterSlots(auth);
            return {
              auth,
              characterSlots: __spreadProps(__spreadValues({}, characterSlots), {
                characters: [...characterSlots.characters]
              })
            };
          } catch (error) {
            const failedPhase = state.phase;
            const message = (error == null ? void 0 : error.message) || String(error);
            state.lastError = message;
            setPhase("error");
            yield reportPhase("error", {
              failedPhase,
              error: message
            });
            throw error;
          }
        });
      },
      selectCharacter(characterId) {
        return __async(this, null, function* () {
          try {
            const auth = state.auth || (yield resolveAuth());
            state.auth = auth;
            if (state.phase !== "selecting_character") {
              setPhase("selecting_character");
              yield reportPhase("selecting_character");
            }
            const slots = state.characterSlots.characters.length > 0 ? state.characterSlots : yield ensureCharacterSlots(auth);
            const character = slots.characters.find((entry) => entry.id === characterId);
            if (!character) {
              throw new Error("Selected character is not available on this account.");
            }
            return yield joinResolvedCharacter(auth, {
              id: character.id,
              name: character.name
            }, { selectedCharacterId: character.id });
          } catch (error) {
            const failedPhase = state.phase;
            const message = (error == null ? void 0 : error.message) || String(error);
            state.lastError = message;
            setPhase("error");
            yield reportPhase("error", {
              failedPhase,
              error: message
            });
            throw error;
          }
        });
      },
      createCharacter() {
        return __async(this, arguments, function* ({ name } = {}) {
          try {
            const auth = state.auth || (yield resolveAuth());
            state.auth = auth;
            if (state.phase !== "selecting_character") {
              setPhase("selecting_character");
              yield reportPhase("selecting_character");
            }
            const slots = state.characterSlots.maxCharactersPerAccount === null ? yield ensureCharacterSlots(auth) : state.characterSlots;
            if (Number.isInteger(slots.availableSlots) && slots.availableSlots <= 0) {
              throw new Error("No character slots are available on this account.");
            }
            const desiredName = optionalText(name, defaultNewCharacterName(slots));
            const created = yield http2.post("/characters", {
              accountId: auth.accountId,
              name: desiredName
            }, { auth });
            const createdCharacter = normalizeCharacterSummary(created);
            const nextCharacters = [
              createdCharacter,
              ...slots.characters.filter((entry) => entry.id !== createdCharacter.id)
            ];
            state.characterSlots = __spreadProps(__spreadValues({}, slots), {
              characters: nextCharacters,
              availableSlots: Number.isInteger(slots.maxCharactersPerAccount) ? Math.max(0, slots.maxCharactersPerAccount - nextCharacters.length) : Number.isInteger(slots.availableSlots) ? Math.max(0, slots.availableSlots - 1) : null
            });
            return yield joinResolvedCharacter(auth, {
              id: createdCharacter.id,
              name: createdCharacter.name
            }, { createdCharacterId: createdCharacter.id });
          } catch (error) {
            const failedPhase = state.phase;
            const message = (error == null ? void 0 : error.message) || String(error);
            state.lastError = message;
            setPhase("error");
            yield reportPhase("error", {
              failedPhase,
              error: message
            });
            throw error;
          }
        });
      },
      tick() {
        if (!["connecting_relay", "waiting_welcome", "joined"].includes(state.phase)) {
          return;
        }
        relay.tick(handleRelayPacket);
        maybeSendRelayAcceptedFallback();
      },
      sendTransform,
      sendTransformIfDue,
      sendVoiceState,
      sendVoiceStateIfChanged,
      requestOwnerSnapshot,
      introduceToPeer,
      inspectPeer,
      requestTradeWithPeer,
      sendChat,
      sendStaffDirectMessage,
      setCharacterTitle,
      sendRpExpression,
      rollDice,
      syncWalletGold,
      sellInventory,
      createTradeOffer,
      acceptTradeOffer,
      craftRecipe,
      learnSpellTome,
      requestProfessionMemberships,
      joinProfession,
      requestProfessionInvitations,
      createProfessionInvitation,
      acceptProfessionInvitation,
      payGuildDue,
      claimGuildContract,
      completeGuildContract,
      upsertGuildMember,
      revokeGuildMember,
      requestJailTasks,
      completeJailTask,
      requestResourceNodes,
      gatherResourceNode,
      startDungeonEncounter,
      claimAccountStipend,
      acknowledgeOnboardingTip,
      requestOnboardingPortal,
      approveOnboardingPortal,
      requestJobBoard,
      requestNoticeBoards,
      requestNoticeBoardPosts,
      createNoticeBoardPost,
      archiveNoticeBoardPost,
      claimJob,
      completeJob,
      requestCourierDeliveries,
      claimCourierDelivery,
      completeCourierDelivery,
      requestTaxiRoutes,
      requestTaxiContracts,
      createTaxiContract,
      claimTaxiContract,
      completeTaxiContract,
      requestWantedBoard,
      reportCrime,
      searchCharacter,
      pickpocketCharacter,
      cuffCharacter,
      arrestCharacter,
      seizeCharacterContraband,
      reportInjury,
      requestMedicalCalls,
      treatInjury,
      requestBusinessOrders,
      fulfillBusinessOrder,
      requestBusinessListings,
      buyBusinessListing,
      requestProperties,
      rentProperty,
      purchaseProperty,
      requestPropertySaleListings,
      createPropertySaleListing,
      cancelPropertySaleListing,
      buyPropertySaleListing,
      checkPropertyAccess,
      grantPropertyAccess,
      revokePropertyAccess,
      requestPropertyStorage,
      depositPropertyStorage,
      withdrawPropertyStorage,
      requestStorageAuctionEvents,
      requestStorageAuctionLots,
      bidStorageAuctionLot,
      requestPropertyCharges,
      payPropertyCharge,
      requestPropertyUpgrades,
      installPropertyUpgrade,
      retirePropertyUpgrade,
      requestPropertyLocks,
      checkPropertyLock,
      changePropertyLock,
      issuePropertyKey,
      revokePropertyKey,
      interactProperty,
      reportNpcSpawn,
      handleRelayPacket,
      getState() {
        return __spreadProps(__spreadValues({}, state), {
          characterSlots: __spreadProps(__spreadValues({}, state.characterSlots), {
            characters: [...state.characterSlots.characters]
          }),
          peers: __spreadValues({}, state.peers),
          npcSpawns: __spreadValues({}, state.npcSpawns),
          resourceNodes: __spreadValues({}, state.resourceNodes),
          professionInvitations: [...state.professionInvitations],
          jobBoard: [...state.jobBoard],
          noticeBoards: [...state.noticeBoards],
          noticeBoardPosts: [...state.noticeBoardPosts],
          courierBoard: [...state.courierBoard],
          taxiRoutes: [...state.taxiRoutes],
          taxiContracts: [...state.taxiContracts],
          jailTasks: [...state.jailTasks],
          wantedBoard: [...state.wantedBoard],
          medicalCalls: [...state.medicalCalls],
          businessOrders: [...state.businessOrders],
          businessListings: [...state.businessListings],
          recipes: [...state.recipes],
          propertyListings: [...state.propertyListings],
          propertySaleListings: [...state.propertySaleListings],
          propertyCharges: [...state.propertyCharges],
          propertyStorage: __spreadValues({}, state.propertyStorage),
          propertyUpgrades: __spreadValues({}, state.propertyUpgrades),
          storageAuctionEvents: [...state.storageAuctionEvents],
          storageAuctionLots: [...state.storageAuctionLots],
          skyMpLoginSent: state.skyMpLoginSent,
          skyMpLogin: state.skyMpLogin ? __spreadValues({}, state.skyMpLogin) : null,
          playSession: state.playSession ? __spreadValues({}, state.playSession) : null
        });
      }
    };
  }

  // src/npc-spawn-bridge.js
  function text(value, fallback = "") {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function normalizeCellKey(value) {
    return text(value, "unknown").toLowerCase();
  }
  function sameCell(a, b) {
    return normalizeCellKey((a == null ? void 0 : a.worldspace) || "Tamriel") === normalizeCellKey((b == null ? void 0 : b.worldspace) || "Tamriel") && normalizeCellKey((a == null ? void 0 : a.cell) || "unknown") === normalizeCellKey((b == null ? void 0 : b.cell) || "unknown");
  }
  function isActiveSpawn(spawn) {
    return spawn && text(spawn.status, "active") === "active";
  }
  function toPromise(value) {
    return value && typeof value.then === "function" ? value : Promise.resolve(value);
  }
  function spawnFingerprint(spawn) {
    return [
      spawn.id,
      spawn.baseFormId,
      spawn.worldspace,
      spawn.cell,
      spawn.x,
      spawn.y,
      spawn.z,
      spawn.rotationZ,
      spawn.updatedAt
    ].map((part) => String(part != null ? part : "")).join("|");
  }
  function parseIntegerFormId(raw) {
    if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) {
      return raw;
    }
    const value = text(raw);
    if (!value) {
      return null;
    }
    if (/^0x[0-9a-f]+$/i.test(value)) {
      return Number.parseInt(value.slice(2), 16);
    }
    if (/^[0-9a-f]{6,8}$/i.test(value)) {
      return Number.parseInt(value, 16);
    }
    if (/^[0-9]+$/.test(value)) {
      return Number.parseInt(value, 10);
    }
    return null;
  }
  function normalizeBaseFormMap(value) {
    if (!value) {
      return {};
    }
    if (typeof value === "object") {
      return value;
    }
    if (typeof value !== "string") {
      return {};
    }
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      const map = {};
      for (const entry of value.split(/[;\n]/)) {
        const [key, mapped] = entry.split("=").map((part) => text(part));
        if (key && mapped) {
          map[key] = mapped;
        }
      }
      return map;
    }
  }
  function resolveBaseFormSpec(spawn, baseFormMap = {}) {
    var _a;
    const keys = [
      text(spawn == null ? void 0 : spawn.baseFormId),
      text(spawn == null ? void 0 : spawn.templateCode),
      text(spawn == null ? void 0 : spawn.role)
    ].filter(Boolean);
    let raw = keys.find((key) => baseFormMap[key] !== void 0) || text(spawn == null ? void 0 : spawn.baseFormId);
    raw = (_a = baseFormMap[raw]) != null ? _a : raw;
    if (typeof raw === "number") {
      return { formId: parseIntegerFormId(raw), pluginName: "" };
    }
    const value = text(raw);
    if (!value) {
      return null;
    }
    const pluginMatch = value.match(/^([^:#|]+[.](?:esm|esp|esl))[:#|](.+)$/i);
    if (pluginMatch) {
      return {
        pluginName: pluginMatch[1],
        formId: parseIntegerFormId(pluginMatch[2])
      };
    }
    const formId = parseIntegerFormId(value);
    return formId ? { formId, pluginName: "" } : null;
  }
  function createNpcSpawnBridge({
    adapter,
    getPosition = () => ({}),
    reportSpawn = (_spawnId, _status) => false,
    storage: storage2 = null,
    logger = (_message) => {
    },
    onBridgeEvent = (_event) => {
    },
    localCellOnly = true
  }) {
    if (!adapter || typeof adapter.spawnActor !== "function") {
      throw new Error("NPC spawn bridge adapter with spawnActor is required");
    }
    const state = {
      activeSpawns: /* @__PURE__ */ new Map(),
      renderedSpawns: /* @__PURE__ */ new Map(),
      failedSpawns: /* @__PURE__ */ new Map(),
      reportedKills: /* @__PURE__ */ new Set(),
      lastError: null
    };
    function emitBridgeEvent(event) {
      try {
        onBridgeEvent(event);
      } catch (error) {
        logger(`npc bridge event callback failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      }
    }
    function snapshotStorage() {
      if (!storage2 || typeof storage2 !== "object") {
        return;
      }
      storage2.skyrimRpNpcSpawnBridge = {
        activeSpawnIds: [...state.activeSpawns.keys()],
        renderedSpawnIds: [...state.renderedSpawns.keys()],
        failedSpawnIds: [...state.failedSpawns.keys()],
        reportedKillIds: [...state.reportedKills]
      };
    }
    function shouldRender(spawn) {
      return isActiveSpawn(spawn) && (!localCellOnly || sameCell(spawn, getPosition()));
    }
    function forgetFailure(spawnId) {
      state.failedSpawns.delete(spawnId);
    }
    function despawnLocal(spawnId, reason = "server") {
      var _a, _b, _c;
      const rendered = state.renderedSpawns.get(spawnId);
      if (!rendered) {
        forgetFailure(spawnId);
        snapshotStorage();
        return false;
      }
      state.renderedSpawns.delete(spawnId);
      forgetFailure(spawnId);
      toPromise((_a = adapter.despawnActor) == null ? void 0 : _a.call(adapter, rendered.reference, rendered.spawn, reason)).catch((error) => {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        logger(`npc local despawn failed spawnId=${spawnId}: ${state.lastError}`);
      });
      logger(`npc local despawned spawnId=${spawnId} reason=${reason}`);
      emitBridgeEvent({
        bridgeEvent: "despawned",
        spawnId,
        reason,
        displayName: ((_b = rendered.spawn) == null ? void 0 : _b.displayName) || "",
        referenceId: (_c = rendered.referenceId) != null ? _c : null
      });
      snapshotStorage();
      return true;
    }
    function renderSpawn(spawn) {
      var _a;
      if (state.renderedSpawns.has(spawn.id) || !shouldRender(spawn)) {
        return false;
      }
      const fingerprint = spawnFingerprint(spawn);
      if (state.failedSpawns.get(spawn.id) === fingerprint) {
        return false;
      }
      try {
        const reference = adapter.spawnActor(spawn);
        if (!reference) {
          state.failedSpawns.set(spawn.id, fingerprint);
          logger(`npc local spawn skipped spawnId=${spawn.id}: adapter returned no reference`);
          emitBridgeEvent({
            bridgeEvent: "spawn_skipped",
            spawnId: spawn.id,
            displayName: spawn.displayName || "",
            baseFormId: spawn.baseFormId || "",
            templateCode: spawn.templateCode || "",
            error: "adapter returned no reference"
          });
          snapshotStorage();
          return false;
        }
        const referenceId = (_a = adapter.getReferenceId) == null ? void 0 : _a.call(adapter, reference);
        state.renderedSpawns.set(spawn.id, {
          spawn,
          reference,
          referenceId
        });
        forgetFailure(spawn.id);
        logger(`npc local spawned ${spawn.displayName || spawn.id} spawnId=${spawn.id}`);
        emitBridgeEvent({
          bridgeEvent: "rendered",
          spawnId: spawn.id,
          displayName: spawn.displayName || "",
          baseFormId: spawn.baseFormId || "",
          templateCode: spawn.templateCode || "",
          referenceId: referenceId != null ? referenceId : null
        });
        snapshotStorage();
        return true;
      } catch (error) {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        if (!(error == null ? void 0 : error.transient)) {
          state.failedSpawns.set(spawn.id, fingerprint);
        }
        logger(`npc local spawn failed spawnId=${spawn.id}: ${state.lastError}`);
        emitBridgeEvent({
          bridgeEvent: "spawn_failed",
          spawnId: spawn.id,
          displayName: spawn.displayName || "",
          baseFormId: spawn.baseFormId || "",
          templateCode: spawn.templateCode || "",
          error: state.lastError,
          transient: Boolean(error == null ? void 0 : error.transient)
        });
        snapshotStorage();
        return false;
      }
    }
    function syncRenderedSpawns() {
      for (const [spawnId, rendered] of state.renderedSpawns) {
        const activeSpawn = state.activeSpawns.get(spawnId);
        if (!activeSpawn || !shouldRender(activeSpawn)) {
          despawnLocal(spawnId, activeSpawn ? "left_cell" : "server_removed");
        } else if (activeSpawn !== rendered.spawn) {
          rendered.spawn = activeSpawn;
        }
      }
      for (const spawn of state.activeSpawns.values()) {
        renderSpawn(spawn);
      }
      snapshotStorage();
    }
    function applyActiveSpawn(spawn) {
      if (!(spawn == null ? void 0 : spawn.id)) {
        return;
      }
      if (isActiveSpawn(spawn)) {
        state.activeSpawns.set(spawn.id, spawn);
        forgetFailure(spawn.id);
      } else {
        state.activeSpawns.delete(spawn.id);
        despawnLocal(spawn.id, spawn.status || "inactive");
      }
    }
    function handleNpcSpawnEvent2(event) {
      if (!event || typeof event !== "object") {
        return;
      }
      if (event.type === "snapshot") {
        const nextIds = /* @__PURE__ */ new Set();
        state.activeSpawns.clear();
        for (const spawn of Array.isArray(event.spawns) ? event.spawns : []) {
          if (isActiveSpawn(spawn)) {
            state.activeSpawns.set(spawn.id, spawn);
            nextIds.add(spawn.id);
          }
        }
        for (const spawnId of state.renderedSpawns.keys()) {
          if (!nextIds.has(spawnId)) {
            despawnLocal(spawnId, "snapshot_removed");
          }
        }
        syncRenderedSpawns();
        return;
      }
      if (event.spawn) {
        applyActiveSpawn(event.spawn);
        syncRenderedSpawns();
        return;
      }
      if (event.spawnId) {
        state.activeSpawns.delete(event.spawnId);
        despawnLocal(event.spawnId, event.type);
        syncRenderedSpawns();
      }
    }
    function handleActorKill(event) {
      var _a, _b;
      const victim = event == null ? void 0 : event.victim;
      if (!victim) {
        return false;
      }
      for (const [spawnId, rendered] of state.renderedSpawns) {
        const matches = adapter.referencesEqual ? adapter.referencesEqual(victim, rendered.reference, rendered.referenceId) : victim === rendered.reference;
        if (!matches) {
          continue;
        }
        if (state.reportedKills.has(spawnId)) {
          return false;
        }
        state.reportedKills.add(spawnId);
        const sent = reportSpawn(spawnId, "killed");
        logger(`npc local death reported spawnId=${spawnId} sent=${sent}`);
        emitBridgeEvent({
          bridgeEvent: "death_reported",
          spawnId,
          displayName: ((_a = rendered.spawn) == null ? void 0 : _a.displayName) || "",
          referenceId: (_b = rendered.referenceId) != null ? _b : null,
          sent
        });
        snapshotStorage();
        return sent;
      }
      return false;
    }
    function tick() {
      syncRenderedSpawns();
    }
    return {
      state,
      handleNpcSpawnEvent: handleNpcSpawnEvent2,
      handleActorKill,
      tick,
      getState() {
        return {
          activeSpawnIds: [...state.activeSpawns.keys()],
          renderedSpawnIds: [...state.renderedSpawns.keys()],
          failedSpawnIds: [...state.failedSpawns.keys()],
          reportedKillIds: [...state.reportedKills],
          lastError: state.lastError
        };
      }
    };
  }

  // src/peer-avatar-bridge.js
  function text2(value, fallback = "") {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function locationKey(value) {
    return text2(value, "unknown").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  var worldspaceAliases = /* @__PURE__ */ new Map([
    ["skyrim", "Tamriel"],
    ["tamriel", "Tamriel"]
  ]);
  var cellAliases = /* @__PURE__ */ new Map([
    ["sleepinggiantinn", "RiverwoodSleepingGiantInn"],
    ["riverwoodsleepinggiantinn", "RiverwoodSleepingGiantInn"]
  ]);
  function canonicalWorldspace(value) {
    const original = text2(value, "unknown");
    return worldspaceAliases.get(locationKey(original)) || original;
  }
  function canonicalCell(value) {
    const original = text2(value, "unknown");
    return cellAliases.get(locationKey(original)) || original;
  }
  function sameCell2(a, b) {
    return locationKey(canonicalWorldspace(a == null ? void 0 : a.worldspace)) !== "unknown" && locationKey(canonicalCell(a == null ? void 0 : a.cell)) !== "unknown" && locationKey(canonicalWorldspace(a == null ? void 0 : a.worldspace)) === locationKey(canonicalWorldspace(b == null ? void 0 : b.worldspace)) && locationKey(canonicalCell(a == null ? void 0 : a.cell)) === locationKey(canonicalCell(b == null ? void 0 : b.cell));
  }
  function toPromise2(value) {
    return value && typeof value.then === "function" ? value : Promise.resolve(value);
  }
  function numberValue(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function peerFingerprint(peer) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return [
      peer.clientId,
      peer.displayName,
      peer.overlayName,
      (_a = peer.activeTitle) == null ? void 0 : _a.title,
      (_b = peer.activeTitle) == null ? void 0 : _b.visibility,
      (_c = peer.position) == null ? void 0 : _c.worldspace,
      (_d = peer.position) == null ? void 0 : _d.cell,
      (_e = peer.position) == null ? void 0 : _e.x,
      (_f = peer.position) == null ? void 0 : _f.y,
      (_g = peer.position) == null ? void 0 : _g.z,
      (_h = peer.position) == null ? void 0 : _h.rotationZ,
      peer.speaking
    ].map((part) => String(part != null ? part : "")).join("|");
  }
  function peerToAvatar(peer, baseFormId) {
    var _a, _b, _c, _d, _e, _f;
    return {
      clientId: text2(peer == null ? void 0 : peer.clientId),
      displayName: text2(peer == null ? void 0 : peer.overlayName, text2(peer == null ? void 0 : peer.displayName, text2(peer == null ? void 0 : peer.clientId, "Player"))),
      characterName: text2(peer == null ? void 0 : peer.displayName, text2(peer == null ? void 0 : peer.clientId, "Player")),
      activeTitle: (peer == null ? void 0 : peer.activeTitle) || null,
      baseFormId,
      speaking: Boolean(peer == null ? void 0 : peer.speaking),
      worldspace: canonicalWorldspace((_a = peer == null ? void 0 : peer.position) == null ? void 0 : _a.worldspace),
      cell: canonicalCell((_b = peer == null ? void 0 : peer.position) == null ? void 0 : _b.cell),
      x: numberValue((_c = peer == null ? void 0 : peer.position) == null ? void 0 : _c.x),
      y: numberValue((_d = peer == null ? void 0 : peer.position) == null ? void 0 : _d.y),
      z: numberValue((_e = peer == null ? void 0 : peer.position) == null ? void 0 : _e.z),
      rotationZ: numberValue((_f = peer == null ? void 0 : peer.position) == null ? void 0 : _f.rotationZ)
    };
  }
  function createPeerAvatarBridge({
    adapter,
    getPosition = () => ({}),
    storage: storage2 = null,
    logger = (_message) => {
    },
    onBridgeEvent = (_event) => {
    },
    canRender = () => true,
    localCellOnly = true,
    baseFormId = "0x00000007"
  }) {
    if (!adapter || typeof adapter.spawnAvatar !== "function") {
      throw new Error("Peer avatar bridge adapter with spawnAvatar is required");
    }
    const state = {
      peers: /* @__PURE__ */ new Map(),
      renderedPeers: /* @__PURE__ */ new Map(),
      failedPeers: /* @__PURE__ */ new Map(),
      lastError: null
    };
    function emitBridgeEvent(event) {
      try {
        onBridgeEvent(event);
      } catch (error) {
        logger(`peer avatar event callback failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      }
    }
    function snapshotStorage() {
      if (!storage2 || typeof storage2 !== "object") {
        return;
      }
      storage2.skyrimRpPeerAvatarBridge = {
        peerClientIds: [...state.peers.keys()],
        renderedClientIds: [...state.renderedPeers.keys()],
        failedClientIds: [...state.failedPeers.keys()],
        lastError: state.lastError
      };
    }
    function shouldRender(peer) {
      return (peer == null ? void 0 : peer.clientId) && (peer == null ? void 0 : peer.position) && canRender() && (!localCellOnly || sameCell2(peer.position, getPosition()));
    }
    function forgetFailure(clientId) {
      state.failedPeers.delete(clientId);
    }
    function despawnLocal(clientId, reason = "server") {
      var _a, _b, _c;
      const rendered = state.renderedPeers.get(clientId);
      if (!rendered) {
        forgetFailure(clientId);
        snapshotStorage();
        return false;
      }
      state.renderedPeers.delete(clientId);
      forgetFailure(clientId);
      toPromise2((_a = adapter.despawnAvatar) == null ? void 0 : _a.call(adapter, rendered.reference, rendered.avatar, reason)).catch((error) => {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        logger(`peer avatar despawn failed clientId=${clientId}: ${state.lastError}`);
      });
      logger(`peer avatar despawned clientId=${clientId} reason=${reason}`);
      emitBridgeEvent({
        bridgeEvent: "despawned",
        clientId,
        reason,
        displayName: ((_b = rendered.avatar) == null ? void 0 : _b.displayName) || "",
        referenceId: (_c = rendered.referenceId) != null ? _c : null
      });
      snapshotStorage();
      return true;
    }
    function updateRenderedPeer(clientId, peer) {
      var _a;
      const rendered = state.renderedPeers.get(clientId);
      if (!rendered) {
        return false;
      }
      const avatar = peerToAvatar(peer, baseFormId);
      if (rendered.fingerprint === peerFingerprint(peer)) {
        return true;
      }
      const previousAvatar = rendered.avatar;
      rendered.avatar = avatar;
      rendered.fingerprint = peerFingerprint(peer);
      toPromise2((_a = adapter.updateAvatar) == null ? void 0 : _a.call(adapter, rendered.reference, avatar, previousAvatar)).catch((error) => {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        logger(`peer avatar update failed clientId=${clientId}: ${state.lastError}`);
        emitBridgeEvent({
          bridgeEvent: "update_failed",
          clientId,
          displayName: avatar.displayName,
          error: state.lastError
        });
        snapshotStorage();
      });
      snapshotStorage();
      return true;
    }
    function renderPeer(peer) {
      var _a;
      if (!shouldRender(peer)) {
        return false;
      }
      if (state.renderedPeers.has(peer.clientId)) {
        return updateRenderedPeer(peer.clientId, peer);
      }
      const fingerprint = peerFingerprint(peer);
      if (state.failedPeers.get(peer.clientId) === fingerprint) {
        return false;
      }
      const avatar = peerToAvatar(peer, baseFormId);
      try {
        const reference = adapter.spawnAvatar(avatar);
        if (!reference) {
          state.failedPeers.set(peer.clientId, fingerprint);
          logger(`peer avatar spawn skipped clientId=${peer.clientId}: adapter returned no reference`);
          emitBridgeEvent({
            bridgeEvent: "spawn_skipped",
            clientId: peer.clientId,
            displayName: avatar.displayName,
            baseFormId: avatar.baseFormId,
            error: "adapter returned no reference"
          });
          snapshotStorage();
          return false;
        }
        const referenceId = (_a = adapter.getReferenceId) == null ? void 0 : _a.call(adapter, reference);
        state.renderedPeers.set(peer.clientId, {
          peer,
          avatar,
          reference,
          referenceId,
          fingerprint
        });
        forgetFailure(peer.clientId);
        logger(`peer avatar spawned ${avatar.displayName} clientId=${peer.clientId}`);
        emitBridgeEvent({
          bridgeEvent: "rendered",
          clientId: peer.clientId,
          displayName: avatar.displayName,
          baseFormId: avatar.baseFormId,
          referenceId: referenceId != null ? referenceId : null
        });
        snapshotStorage();
        return true;
      } catch (error) {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        if (!(error == null ? void 0 : error.transient)) {
          state.failedPeers.set(peer.clientId, fingerprint);
        }
        logger(`peer avatar spawn failed clientId=${peer.clientId}: ${state.lastError}`);
        emitBridgeEvent({
          bridgeEvent: "spawn_failed",
          clientId: peer.clientId,
          displayName: avatar.displayName,
          baseFormId: avatar.baseFormId,
          error: state.lastError,
          transient: Boolean(error == null ? void 0 : error.transient)
        });
        snapshotStorage();
        return false;
      }
    }
    function syncRenderedPeers() {
      for (const [clientId, rendered] of state.renderedPeers) {
        const peer = state.peers.get(clientId);
        if (!peer || !shouldRender(peer)) {
          despawnLocal(clientId, peer ? "left_cell" : "server_removed");
        } else {
          rendered.peer = peer;
          updateRenderedPeer(clientId, peer);
        }
      }
      for (const peer of state.peers.values()) {
        renderPeer(peer);
      }
      snapshotStorage();
    }
    function applyPeer(peer) {
      if (!(peer == null ? void 0 : peer.clientId)) {
        return;
      }
      state.peers.set(peer.clientId, peer);
      forgetFailure(peer.clientId);
    }
    function handlePeerEvent2(event) {
      if (!event || typeof event !== "object") {
        return;
      }
      if (event.type === "snapshot") {
        const nextIds = /* @__PURE__ */ new Set();
        state.peers.clear();
        for (const peer of Array.isArray(event.peers) ? event.peers : []) {
          if (peer == null ? void 0 : peer.clientId) {
            state.peers.set(peer.clientId, peer);
            nextIds.add(peer.clientId);
          }
        }
        for (const clientId of state.renderedPeers.keys()) {
          if (!nextIds.has(clientId)) {
            despawnLocal(clientId, "snapshot_removed");
          }
        }
        syncRenderedPeers();
        return;
      }
      if (event.type === "left") {
        state.peers.delete(event.clientId);
        despawnLocal(event.clientId, "left");
        syncRenderedPeers();
        return;
      }
      if (event.peer) {
        const peer = event.type === "voice_state" ? __spreadProps(__spreadValues({}, event.peer), { speaking: Boolean(event.speaking) }) : event.peer;
        applyPeer(peer);
        syncRenderedPeers();
      }
    }
    function tick() {
      syncRenderedPeers();
    }
    return {
      state,
      handlePeerEvent: handlePeerEvent2,
      tick,
      getState() {
        return {
          peerClientIds: [...state.peers.keys()],
          renderedClientIds: [...state.renderedPeers.keys()],
          failedClientIds: [...state.failedPeers.keys()],
          lastError: state.lastError
        };
      }
    };
  }

  // src/resource-node-bridge.js
  function text3(value, fallback = "") {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function numberValue2(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  function locationKey2(value) {
    return text3(value, "unknown").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  var worldspaceAliases2 = /* @__PURE__ */ new Map([
    ["skyrim", "Tamriel"],
    ["tamriel", "Tamriel"]
  ]);
  var cellAliases2 = /* @__PURE__ */ new Map([
    ["sleepinggiantinn", "RiverwoodSleepingGiantInn"],
    ["riverwoodsleepinggiantinn", "RiverwoodSleepingGiantInn"]
  ]);
  function canonicalWorldspace2(value) {
    const original = text3(value, "unknown");
    return worldspaceAliases2.get(locationKey2(original)) || original;
  }
  function canonicalCell2(value) {
    const original = text3(value, "unknown");
    return cellAliases2.get(locationKey2(original)) || original;
  }
  function nodePosition(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
      worldspace: canonicalWorldspace2(((_a = node == null ? void 0 : node.reference) == null ? void 0 : _a.worldspace) || (node == null ? void 0 : node.worldspace)),
      cell: canonicalCell2(((_b = node == null ? void 0 : node.reference) == null ? void 0 : _b.cell) || (node == null ? void 0 : node.cell)),
      x: numberValue2((_d = (_c = node == null ? void 0 : node.reference) == null ? void 0 : _c.x) != null ? _d : node == null ? void 0 : node.x),
      y: numberValue2((_f = (_e = node == null ? void 0 : node.reference) == null ? void 0 : _e.y) != null ? _f : node == null ? void 0 : node.y),
      z: numberValue2((_h = (_g = node == null ? void 0 : node.reference) == null ? void 0 : _g.z) != null ? _h : node == null ? void 0 : node.z)
    };
  }
  function playerPosition(position) {
    return {
      worldspace: canonicalWorldspace2(position == null ? void 0 : position.worldspace),
      cell: canonicalCell2(position == null ? void 0 : position.cell),
      x: numberValue2(position == null ? void 0 : position.x),
      y: numberValue2(position == null ? void 0 : position.y),
      z: numberValue2(position == null ? void 0 : position.z)
    };
  }
  function cellKey(position) {
    const normalized = playerPosition(position);
    if (locationKey2(normalized.worldspace) === "unknown" || locationKey2(normalized.cell) === "unknown") {
      return "";
    }
    return `${locationKey2(normalized.worldspace)}/${locationKey2(normalized.cell)}`;
  }
  function sameCell3(a, b) {
    const left = cellKey(a);
    return left !== "" && left === cellKey(b);
  }
  function distanceSquared(a, b) {
    const dx = numberValue2(a == null ? void 0 : a.x) - numberValue2(b == null ? void 0 : b.x);
    const dy = numberValue2(a == null ? void 0 : a.y) - numberValue2(b == null ? void 0 : b.y);
    const dz = numberValue2(a == null ? void 0 : a.z) - numberValue2(b == null ? void 0 : b.z);
    return dx * dx + dy * dy + dz * dz;
  }
  function availableByTime(node, nowIso) {
    const availableAt = text3(node == null ? void 0 : node.availableAt);
    return availableAt !== "" && availableAt <= nowIso;
  }
  function isAvailableNode(node, nowIso) {
    return Boolean((node == null ? void 0 : node.enabled) !== false) && (text3(node == null ? void 0 : node.state, "available") === "available" || availableByTime(node, nowIso));
  }
  function createResourceNodeBridge({
    getPosition = () => ({}),
    requestResourceNodes = (_filters = {}) => false,
    gatherResourceNode = (_nodeCode) => false,
    storage: storage2 = null,
    logger = (_message) => {
    },
    onBridgeEvent = (_event) => {
    },
    localCellOnly = true,
    gatherRadius = 180,
    autoRequestOnCellChange = true,
    requestCooldownMs = 1500,
    now = () => Date.now()
  } = {}) {
    const state = {
      nodes: /* @__PURE__ */ new Map(),
      lastCellKey: "",
      lastRequestAt: 0,
      lastRequestedCellKey: "",
      lastGatherNodeCode: null,
      previousGatherPressed: false,
      lastError: null
    };
    function emitBridgeEvent(event) {
      try {
        onBridgeEvent(event);
      } catch (error) {
        logger(`resource bridge event callback failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      }
    }
    function snapshotStorage() {
      if (!storage2 || typeof storage2 !== "object") {
        return;
      }
      storage2.skyrimRpResourceNodeBridge = {
        nodeCodes: [...state.nodes.keys()],
        availableNodeCodes: [...availableNodes().map((entry) => entry.node.code)],
        lastCellKey: state.lastCellKey,
        lastRequestedCellKey: state.lastRequestedCellKey,
        lastGatherNodeCode: state.lastGatherNodeCode,
        lastError: state.lastError
      };
    }
    function applyNode(node) {
      if (!(node == null ? void 0 : node.code)) {
        return;
      }
      state.nodes.set(node.code, node);
    }
    function availableNodes(options = {}) {
      const position = playerPosition(getPosition());
      const currentIso = new Date(now()).toISOString();
      const resourceType = text3(options.resourceType);
      const maxDistance = Number.isFinite(Number(options.maxDistance)) ? Number(options.maxDistance) : Number(gatherRadius || 0);
      const maxDistanceSquared = maxDistance > 0 ? maxDistance * maxDistance : null;
      return [...state.nodes.values()].filter((node) => isAvailableNode(node, currentIso)).filter((node) => !resourceType || text3(node.resourceType) === resourceType).filter((node) => !localCellOnly || sameCell3(position, nodePosition(node))).map((node) => ({
        node,
        distanceSquared: distanceSquared(position, nodePosition(node))
      })).filter((entry) => maxDistanceSquared === null || entry.distanceSquared <= maxDistanceSquared).sort((a, b) => a.distanceSquared - b.distanceSquared);
    }
    function requestCurrentCell(reason = "manual") {
      const position = playerPosition(getPosition());
      const key = cellKey(position);
      if (!key) {
        return false;
      }
      const current = now();
      if (state.lastRequestedCellKey === key && current - state.lastRequestAt < requestCooldownMs) {
        return false;
      }
      try {
        const sent = requestResourceNodes({
          worldspace: position.worldspace,
          cell: position.cell
        });
        if (!sent) {
          return false;
        }
        state.lastRequestAt = current;
        state.lastRequestedCellKey = key;
        logger(`resource nodes requested cell=${position.worldspace}/${position.cell} reason=${reason}`);
        emitBridgeEvent({
          bridgeEvent: "request_sent",
          reason,
          worldspace: position.worldspace,
          cell: position.cell
        });
        snapshotStorage();
        return true;
      } catch (error) {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        logger(`resource node request failed: ${state.lastError}`);
        emitBridgeEvent({
          bridgeEvent: "request_failed",
          reason,
          error: state.lastError
        });
        snapshotStorage();
        return false;
      }
    }
    function gatherNearestAvailable(options = {}) {
      var _a;
      const nearest = ((_a = availableNodes(options)[0]) == null ? void 0 : _a.node) || null;
      if (!nearest) {
        logger("resource gather skipped: no available node nearby");
        emitBridgeEvent({
          bridgeEvent: "gather_skipped",
          reason: "no_available_node"
        });
        snapshotStorage();
        return false;
      }
      try {
        const sent = gatherResourceNode(nearest.code);
        if (!sent) {
          return false;
        }
        state.lastGatherNodeCode = nearest.code;
        logger(`resource gather requested nodeCode=${nearest.code}`);
        emitBridgeEvent({
          bridgeEvent: "gather_requested",
          nodeCode: nearest.code,
          displayName: text3(nearest.displayName)
        });
        snapshotStorage();
        return true;
      } catch (error) {
        state.lastError = (error == null ? void 0 : error.message) || String(error);
        logger(`resource gather failed nodeCode=${nearest.code}: ${state.lastError}`);
        emitBridgeEvent({
          bridgeEvent: "gather_failed",
          nodeCode: nearest.code,
          error: state.lastError
        });
        snapshotStorage();
        return false;
      }
    }
    function handleGatherInput(pressed) {
      const isPressed = Boolean(pressed);
      const shouldGather = isPressed && !state.previousGatherPressed;
      state.previousGatherPressed = isPressed;
      if (!shouldGather) {
        return false;
      }
      return gatherNearestAvailable();
    }
    function handleResourceEvent2(event) {
      var _a;
      if (!event || typeof event !== "object") {
        return;
      }
      if (event.type === "snapshot") {
        state.nodes.clear();
        for (const node2 of Array.isArray(event.nodes) ? event.nodes : []) {
          applyNode(node2);
        }
        emitBridgeEvent({
          bridgeEvent: "snapshot",
          reason: text3(event.reason),
          nodeCount: state.nodes.size
        });
        snapshotStorage();
        return;
      }
      const node = event.node || ((_a = event.result) == null ? void 0 : _a.node);
      if (node) {
        applyNode(node);
        emitBridgeEvent({
          bridgeEvent: event.type === "resource_gather_result" ? "gather_result" : "updated",
          nodeCode: node.code,
          state: text3(node.state)
        });
        snapshotStorage();
      }
    }
    function tick() {
      const key = cellKey(getPosition());
      if (key && key !== state.lastCellKey) {
        state.lastCellKey = key;
        if (autoRequestOnCellChange) {
          requestCurrentCell("cell_changed");
        }
      }
      snapshotStorage();
    }
    return {
      state,
      handleResourceEvent: handleResourceEvent2,
      handleGatherInput,
      gatherNearestAvailable,
      requestCurrentCell,
      tick,
      getState() {
        return {
          nodeCodes: [...state.nodes.keys()],
          availableNodeCodes: [...availableNodes().map((entry) => entry.node.code)],
          lastCellKey: state.lastCellKey,
          lastRequestedCellKey: state.lastRequestedCellKey,
          lastGatherNodeCode: state.lastGatherNodeCode,
          lastError: state.lastError
        };
      }
    };
  }

  // src/onboarding-room-bridge.js
  function text4(value, fallback = "") {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function optionalArray2(value) {
    return Array.isArray(value) ? value : [];
  }
  function lower(value) {
    return text4(value).toLowerCase();
  }
  function destinationForAnchor(onboarding, anchorCode) {
    const cleanAnchor = lower(anchorCode);
    if (!cleanAnchor) {
      return null;
    }
    return optionalArray2(onboarding == null ? void 0 : onboarding.destinations).find((destination) => lower(destination.code) === cleanAnchor || lower(destination.portalCode) === cleanAnchor || lower(destination.worldReferenceCode) === cleanAnchor) || null;
  }
  function tipForAnchor(onboarding, anchorCode) {
    const cleanAnchor = lower(anchorCode);
    if (!cleanAnchor) {
      return null;
    }
    const starterTips = optionalArray2(onboarding == null ? void 0 : onboarding.starterTips);
    const tips = starterTips.length > 0 ? starterTips : optionalArray2(onboarding == null ? void 0 : onboarding.tutorialTips);
    return tips.find((tip) => lower(tip.code) === cleanAnchor || lower(tip.triggerCode) === cleanAnchor || lower(tip.worldReferenceCode) === cleanAnchor) || null;
  }
  function createOnboardingRoomBridge({
    getOnboarding = () => null,
    acknowledgeTip = (_tipCode, _options = {}) => false,
    approvePortal = (_destinationCode, _options = {}) => false,
    loadDestination = (_request = {}) => false,
    showTip = (_tip) => {
    },
    storage: storage2 = null,
    logger = (_message) => {
    },
    onBridgeEvent = (_event) => {
    }
  } = {}) {
    const state = {
      onboarding: null,
      lastAnchorCode: null,
      lastTipCode: null,
      lastPortalCode: null,
      pendingPortalCode: null,
      lastApprovedDestinationCode: null,
      lastError: null
    };
    function emitBridgeEvent(event) {
      try {
        onBridgeEvent(event);
      } catch (error) {
        logger(`onboarding room bridge event callback failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      }
    }
    function snapshotStorage() {
      if (!storage2 || typeof storage2 !== "object") {
        return;
      }
      storage2.skyrimRpOnboardingRoomBridge = {
        lastAnchorCode: state.lastAnchorCode,
        lastTipCode: state.lastTipCode,
        lastPortalCode: state.lastPortalCode,
        pendingPortalCode: state.pendingPortalCode,
        lastApprovedDestinationCode: state.lastApprovedDestinationCode,
        lastError: state.lastError
      };
    }
    function currentOnboarding() {
      return state.onboarding || getOnboarding() || null;
    }
    function setOnboarding(onboarding) {
      state.onboarding = onboarding || null;
      snapshotStorage();
    }
    function handleAnchor(anchorCode, source = "onboarding_room_trigger") {
      const cleanAnchorCode = text4(anchorCode);
      if (!cleanAnchorCode) {
        return false;
      }
      state.lastAnchorCode = cleanAnchorCode;
      const onboarding = currentOnboarding();
      const tip = tipForAnchor(onboarding, cleanAnchorCode);
      if (tip) {
        const sent = acknowledgeTip(tip.code, { source });
        if (!sent) {
          return false;
        }
        state.lastTipCode = tip.code;
        showTip(tip);
        emitBridgeEvent({
          bridgeEvent: "tip_requested",
          tipCode: tip.code,
          triggerCode: tip.triggerCode,
          source
        });
        snapshotStorage();
        return true;
      }
      const destination = destinationForAnchor(onboarding, cleanAnchorCode);
      if (destination) {
        const sent = approvePortal(destination.code, {
          source,
          portalCode: destination.portalCode
        });
        if (!sent) {
          return false;
        }
        state.lastPortalCode = destination.portalCode || destination.code;
        state.pendingPortalCode = destination.code;
        emitBridgeEvent({
          bridgeEvent: "portal_requested",
          destinationCode: destination.code,
          portalCode: destination.portalCode,
          source
        });
        snapshotStorage();
        return true;
      }
      logger(`onboarding room anchor is not mapped: ${cleanAnchorCode}`);
      emitBridgeEvent({
        bridgeEvent: "anchor_unmapped",
        anchorCode: cleanAnchorCode,
        source
      });
      snapshotStorage();
      return false;
    }
    function handleOnboardingEvent2(event) {
      var _a, _b, _c;
      if (!event || typeof event !== "object") {
        return false;
      }
      if (event.onboarding) {
        setOnboarding(event.onboarding);
      }
      if (event.type === "onboarding_tip_acknowledged") {
        const tip = ((_a = event.result) == null ? void 0 : _a.tip) || null;
        if (tip) {
          state.lastTipCode = tip.code || state.lastTipCode;
          showTip(tip);
        }
        emitBridgeEvent({
          bridgeEvent: "tip_acknowledged",
          tipCode: (tip == null ? void 0 : tip.code) || state.lastTipCode
        });
        snapshotStorage();
        return true;
      }
      if (event.type === "onboarding_portal_approved") {
        const destination = ((_b = event.result) == null ? void 0 : _b.destination) || null;
        state.pendingPortalCode = null;
        state.lastApprovedDestinationCode = (destination == null ? void 0 : destination.code) || state.lastApprovedDestinationCode;
        const loaded = loadDestination({
          destination,
          spawnState: ((_c = event.result) == null ? void 0 : _c.spawnState) || null,
          result: event.result || null,
          onboarding: event.onboarding || null
        });
        emitBridgeEvent({
          bridgeEvent: loaded ? "portal_loaded" : "portal_approved",
          destinationCode: (destination == null ? void 0 : destination.code) || null
        });
        snapshotStorage();
        return true;
      }
      return false;
    }
    return {
      state,
      setOnboarding,
      handleAnchor,
      handleOnboardingEvent: handleOnboardingEvent2,
      getState() {
        return __spreadValues({}, state);
      }
    };
  }

  // src/rp-overview-service.js
  function finiteInterval(value, fallback = 5e3) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(1e3, parsed) : fallback;
  }
  function optionalArray3(value) {
    return Array.isArray(value) ? value : [];
  }
  function errorMessage(error) {
    return (error == null ? void 0 : error.message) || String(error);
  }
  function normalizeAvailable(available = {}) {
    return {
      jobBoard: optionalArray3(available.jobBoard),
      noticeBoards: optionalArray3(available.noticeBoards),
      noticeBoardPosts: optionalArray3(available.noticeBoardPosts),
      guilds: optionalArray3(available.guilds),
      guildRosters: optionalArray3(available.guildRosters),
      guildContracts: optionalArray3(available.guildContracts),
      propertyInteractions: optionalArray3(available.propertyInteractions),
      rentableProperties: optionalArray3(available.rentableProperties),
      purchasableProperties: optionalArray3(available.purchasableProperties),
      propertySaleListings: optionalArray3(available.propertySaleListings),
      storageAuctionEvents: optionalArray3(available.storageAuctionEvents),
      storageAuctionLots: optionalArray3(available.storageAuctionLots),
      courierBoard: optionalArray3(available.courierBoard),
      businessOrders: optionalArray3(available.businessOrders),
      businessListings: optionalArray3(available.businessListings),
      recipes: optionalArray3(available.recipes),
      resourceNodes: optionalArray3(available.resourceNodes),
      taxiRoutes: optionalArray3(available.taxiRoutes),
      taxiContracts: optionalArray3(available.taxiContracts),
      territories: optionalArray3(available.territories),
      wantedBoard: optionalArray3(available.wantedBoard),
      medicalCalls: optionalArray3(available.medicalCalls),
      spells: optionalArray3(available.spells)
    };
  }
  function normalizeRpOverview(payload = {}) {
    const overview = payload && typeof payload === "object" ? payload : {};
    return {
      character: overview.character || null,
      inventory: optionalArray3(overview.inventory),
      equipment: optionalArray3(overview.equipment),
      professions: optionalArray3(overview.professions),
      professionMemberships: optionalArray3(overview.professionMemberships),
      professionInvitations: optionalArray3(overview.professionInvitations),
      spells: optionalArray3(overview.spells),
      guildMemberships: optionalArray3(overview.guildMemberships),
      guildDues: optionalArray3(overview.guildDues),
      guildContractClaims: optionalArray3(overview.guildContractClaims),
      territoryOffices: optionalArray3(overview.territoryOffices),
      knownCharacters: optionalArray3(overview.knownCharacters),
      reputation: optionalArray3(overview.reputation),
      properties: optionalArray3(overview.properties),
      propertyRecoveryCases: optionalArray3(overview.propertyRecoveryCases),
      propertyCharges: optionalArray3(overview.propertyCharges),
      storageAuctionEvents: optionalArray3(overview.storageAuctionEvents),
      storageAuctionLots: optionalArray3(overview.storageAuctionLots),
      businesses: optionalArray3(overview.businesses),
      jobs: optionalArray3(overview.jobs),
      courierDeliveries: optionalArray3(overview.courierDeliveries),
      mailInbox: optionalArray3(overview.mailInbox),
      taxiContracts: optionalArray3(overview.taxiContracts),
      taxiRides: optionalArray3(overview.taxiRides),
      medicalCalls: optionalArray3(overview.medicalCalls),
      activeCuff: overview.activeCuff || null,
      activeArrest: overview.activeArrest || null,
      activeJailSentence: overview.activeJailSentence || null,
      custody: overview.custody || null,
      jailTasks: optionalArray3(overview.jailTasks),
      activeInjury: overview.activeInjury || null,
      available: normalizeAvailable(overview.available),
      ownerState: optionalArray3(overview.ownerState)
    };
  }
  function createRpOverviewService({
    http: http2,
    joinClient: joinClient2,
    intervalMs = 5e3,
    logger = (_message) => {
    },
    reportDiagnostic = (_0, ..._1) => __async(null, [_0, ..._1], function* (_eventType, _details = {}) {
    }),
    onUpdate = (_overview, _reason) => {
    },
    now = () => Date.now()
  }) {
    if (!http2 || typeof http2.get !== "function") {
      throw new Error("http adapter with get is required for RP overview");
    }
    if (!joinClient2 || typeof joinClient2.getState !== "function") {
      throw new Error("joinClient with getState is required for RP overview");
    }
    const state = {
      overview: null,
      intervalMs: finiteInterval(intervalMs),
      lastAttemptAt: 0,
      lastFetchedAt: null,
      lastCharacterId: null,
      lastError: null,
      inFlight: false
    };
    function report(eventType, details = {}) {
      Promise.resolve(reportDiagnostic(eventType, details)).catch((error) => {
        logger(`diagnostic failed: ${errorMessage(error)}`);
      });
    }
    function resetForCharacter(characterId) {
      if (state.lastCharacterId === characterId) {
        return;
      }
      state.overview = null;
      state.lastFetchedAt = null;
      state.lastError = null;
      state.lastCharacterId = characterId;
    }
    function readReadySession() {
      const joinState = joinClient2.getState();
      if (joinState.phase !== "joined") {
        state.overview = null;
        state.lastCharacterId = null;
        return null;
      }
      const auth = joinState.auth || null;
      const character = joinState.character || null;
      const accountId = typeof (auth == null ? void 0 : auth.accountId) === "string" ? auth.accountId.trim() : "";
      const sessionToken = typeof (auth == null ? void 0 : auth.sessionToken) === "string" ? auth.sessionToken.trim() : "";
      const characterId = typeof (character == null ? void 0 : character.id) === "string" ? character.id.trim() : "";
      if (!accountId || !sessionToken || !characterId) {
        return null;
      }
      resetForCharacter(characterId);
      return {
        auth: { accountId, sessionToken },
        characterId
      };
    }
    function refresh() {
      return __async(this, arguments, function* (reason = "manual", currentTime = now()) {
        if (state.inFlight) {
          return false;
        }
        const session = readReadySession();
        if (!session) {
          return false;
        }
        state.inFlight = true;
        state.lastAttemptAt = currentTime;
        try {
          const overview = normalizeRpOverview(yield http2.get(
            `/characters/${encodeURIComponent(session.characterId)}/overview`,
            { auth: session.auth }
          ));
          state.overview = overview;
          state.lastFetchedAt = currentTime;
          state.lastError = null;
          onUpdate(overview, reason);
          report("rp_overview_refresh", {
            reason,
            characterId: session.characterId
          });
          return true;
        } catch (error) {
          state.lastError = errorMessage(error);
          logger(`RP overview refresh failed: ${state.lastError}`);
          report("rp_overview_failed", {
            reason,
            characterId: session.characterId,
            error: state.lastError
          });
          return false;
        } finally {
          state.inFlight = false;
        }
      });
    }
    function tick(currentTime = now()) {
      if (state.inFlight || currentTime - state.lastAttemptAt < state.intervalMs) {
        return false;
      }
      const session = readReadySession();
      if (!session) {
        return false;
      }
      void refresh("tick", currentTime);
      return true;
    }
    function getOverview() {
      return state.overview ? normalizeRpOverview(state.overview) : null;
    }
    return {
      state,
      tick,
      refresh,
      getOverview,
      getState() {
        return __spreadProps(__spreadValues({}, state), {
          overview: getOverview()
        });
      }
    };
  }

  // src/rp-menu-controller.js
  var defaultGetRpOverview = () => null;
  var PROFESSION_LEVEL_THRESHOLDS = Object.freeze([0, 25, 75, 150, 250, 375, 525, 700, 900, 1125]);
  function optionalArray4(value) {
    return Array.isArray(value) ? value : [];
  }
  function label(value, fallback) {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function humanizedCode(value, fallback = "") {
    const clean = label(value, "");
    if (!clean) {
      return fallback;
    }
    return clean.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  function parseCommsSubmit({ mode = "local", text: text5 = "" } = {}) {
    const cleanText = label(text5, "");
    if (!cleanText) {
      return null;
    }
    const slash = cleanText.match(/^\/([a-z]+)(?:\s+([\s\S]*))?$/i);
    if (slash) {
      const command = slash[1].toLowerCase();
      const body = label(slash[2], "");
      if (!body) {
        return null;
      }
      if (["me", "emote"].includes(command)) {
        return { type: "expression", kind: "me", text: body };
      }
      if (command === "do") {
        return { type: "expression", kind: "do", text: body };
      }
      if (["ooc", "looc", "b"].includes(command)) {
        return { type: "expression", kind: "ooc", text: body };
      }
      if (["roll", "r"].includes(command)) {
        return { type: "roll", expression: body };
      }
      if (["local", "l", "say", "s"].includes(command)) {
        return { type: "local", text: body };
      }
    }
    const cleanMode = label(mode, "local").toLowerCase();
    if (cleanMode === "roll") {
      return { type: "roll", expression: cleanText };
    }
    if (["me", "do", "ooc"].includes(cleanMode)) {
      return { type: "expression", kind: cleanMode, text: cleanText };
    }
    return { type: "local", text: cleanText };
  }
  function firstAvailableResource(nodes) {
    return nodes.find((node) => !node.state || node.state === "available") || nodes[0] || null;
  }
  function resourceNodeList(owner, joinState = {}) {
    var _a;
    const overviewNodes = optionalArray4((_a = owner == null ? void 0 : owner.available) == null ? void 0 : _a.resourceNodes);
    if (overviewNodes.length > 0) {
      return overviewNodes;
    }
    if (Array.isArray(joinState.resourceNodes)) {
      return joinState.resourceNodes;
    }
    if (joinState.resourceNodes && typeof joinState.resourceNodes === "object") {
      return Object.values(joinState.resourceNodes);
    }
    return [];
  }
  function resourceMatchesAnchor(resource, anchorCode) {
    const cleanAnchor = label(anchorCode, "");
    return cleanAnchor && (label(resource == null ? void 0 : resource.code, "") === cleanAnchor || label(resource == null ? void 0 : resource.worldReferenceCode, "") === cleanAnchor);
  }
  function resourceDisplayName(resource) {
    return label((resource == null ? void 0 : resource.displayName) || (resource == null ? void 0 : resource.code), "Resource");
  }
  function firstResourceForAnchor(owner, joinState, anchorCode) {
    const matches = resourceNodeList(owner, joinState).filter((resource) => resourceMatchesAnchor(resource, anchorCode));
    return firstAvailableResource(matches);
  }
  function firstUnknownPeer(peers) {
    return peers.find((peer) => peer.identityKnown !== true) || peers[0] || null;
  }
  function firstSpeakingPeer(peers) {
    return peers.find((peer) => (peer == null ? void 0 : peer.speaking) === true) || null;
  }
  var playerTargeting = {
    maxDistance: 450,
    maxAngleDegrees: 35,
    maxVerticalDifference: 180
  };
  function finiteNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function normalizeAngleDegrees(value) {
    const parsed = finiteNumber(value);
    if (parsed === null) {
      return null;
    }
    return (parsed % 360 + 360) % 360;
  }
  function angularDifferenceDegrees(left, right) {
    const normalizedLeft = normalizeAngleDegrees(left);
    const normalizedRight = normalizeAngleDegrees(right);
    if (normalizedLeft === null || normalizedRight === null) {
      return null;
    }
    const difference = Math.abs(normalizedLeft - normalizedRight);
    return Math.min(difference, 360 - difference);
  }
  function positionCellKey(position) {
    if (!position) {
      return "";
    }
    return `${label(position.worldspace, "unknown").toLowerCase()}::${label(position.cell, "unknown").toLowerCase()}`;
  }
  function validPosition(position) {
    if (!position || typeof position !== "object") {
      return null;
    }
    const x = finiteNumber(position.x);
    const y = finiteNumber(position.y);
    const z = finiteNumber(position.z);
    const rotationZ = finiteNumber(position.rotationZ);
    if (x === null || y === null || z === null || rotationZ === null) {
      return null;
    }
    return {
      worldspace: label(position.worldspace, "unknown"),
      cell: label(position.cell, "unknown"),
      x,
      y,
      z,
      rotationZ
    };
  }
  function peerAimScore(peer, selfPosition) {
    const self = validPosition(selfPosition);
    const target = validPosition(peer == null ? void 0 : peer.position);
    if (!self || !target) {
      return null;
    }
    if (positionCellKey(self) !== positionCellKey(target)) {
      return null;
    }
    const dx = target.x - self.x;
    const dy = target.y - self.y;
    const dz = target.z - self.z;
    const planarDistance = Math.sqrt(dx * dx + dy * dy);
    if (planarDistance <= 0 || planarDistance > playerTargeting.maxDistance) {
      return null;
    }
    if (Math.abs(dz) > playerTargeting.maxVerticalDifference) {
      return null;
    }
    const targetAngle = normalizeAngleDegrees(Math.atan2(dx, dy) * 180 / Math.PI);
    const angleDifference = angularDifferenceDegrees(self.rotationZ, targetAngle);
    if (angleDifference === null || angleDifference > playerTargeting.maxAngleDegrees) {
      return null;
    }
    return {
      peer,
      distance: Math.sqrt(planarDistance * planarDistance + dz * dz),
      angleDifference
    };
  }
  function aimedPeer(peers, selfPosition) {
    const scored = peers.map((peer) => peerAimScore(peer, selfPosition)).filter(Boolean).sort((left, right) => left.angleDifference - right.angleDifference || left.distance - right.distance);
    if (scored[0]) {
      return scored[0].peer;
    }
    const hasAnyPeerPosition = peers.some((peer) => validPosition(peer == null ? void 0 : peer.position));
    return hasAnyPeerPosition ? null : peers[0] || null;
  }
  function accountStipendReady(stipend) {
    return (stipend == null ? void 0 : stipend.ready) === true || (stipend == null ? void 0 : stipend.status) === "ready";
  }
  function codeFromEntry(entry) {
    if (typeof entry === "string") {
      return entry.toLowerCase();
    }
    return String((entry == null ? void 0 : entry.professionCode) || (entry == null ? void 0 : entry.guildCode) || (entry == null ? void 0 : entry.code) || (entry == null ? void 0 : entry.name) || (entry == null ? void 0 : entry.type) || "").toLowerCase();
  }
  function ownerCodeSet(owner) {
    const roles = [
      ...optionalArray4(owner.roles),
      ...optionalArray4(owner.accountRoles),
      ...optionalArray4(owner.staffRoles)
    ].map((role) => String(role || "").toLowerCase());
    const memberships = [
      ...professionMemberships(owner),
      ...optionalArray4(owner.professions).filter((entry) => label((entry == null ? void 0 : entry.membershipStatus) || (entry == null ? void 0 : entry.status), "").toLowerCase() === "active")
    ].map(codeFromEntry);
    const guilds = [
      ...optionalArray4(owner.guildMemberships),
      ...optionalArray4(owner.guilds)
    ].map(codeFromEntry);
    return new Set([...roles, ...memberships, ...guilds].filter(Boolean));
  }
  function professionMembershipRecords(owner) {
    return optionalArray4(owner == null ? void 0 : owner.professionMemberships);
  }
  function professionMemberships(owner) {
    return professionMembershipRecords(owner).filter((membership) => (membership == null ? void 0 : membership.status) === void 0 || membership.status === "active");
  }
  function professionCode(entry) {
    return label((entry == null ? void 0 : entry.professionCode) || (entry == null ? void 0 : entry.code), "").toLowerCase();
  }
  var nonKProfessionCodes = /* @__PURE__ */ new Set([
    "merchant",
    "innkeeper",
    "tavern_owner",
    "business_owner",
    "property_steward",
    "building_manager",
    "guild_property_manager",
    "guild_key_manager",
    "guild_key_revoker",
    "guild_room_assigner"
  ]);
  function isKProfessionCode(code) {
    const cleanCode = label(code, "").toLowerCase();
    return Boolean(cleanCode && !nonKProfessionCodes.has(cleanCode));
  }
  function activeProfessionCodes(owner) {
    return new Set(professionMemberships(owner).map(professionCode).filter(isKProfessionCode));
  }
  function primaryProfessionMembership(memberships) {
    return memberships.find((membership) => (membership == null ? void 0 : membership.isPrimary) === true || label(membership == null ? void 0 : membership.pathType, "").toLowerCase() === "primary") || memberships[0] || null;
  }
  function activeProfessionInvitationCodes(owner) {
    return new Set(optionalArray4(owner == null ? void 0 : owner.professionInvitations).filter((invitation) => (invitation == null ? void 0 : invitation.status) === void 0 || invitation.status === "active").map((invitation) => label(invitation == null ? void 0 : invitation.professionCode, "").toLowerCase()).filter(isKProfessionCode));
  }
  function activeProfessionInvitationForCode(owner, professionCodeValue) {
    const cleanCode = label(professionCodeValue, "").toLowerCase();
    if (!cleanCode) {
      return null;
    }
    return optionalArray4(owner == null ? void 0 : owner.professionInvitations).find((invitation) => ((invitation == null ? void 0 : invitation.status) === void 0 || invitation.status === "active") && label(invitation == null ? void 0 : invitation.professionCode, "").toLowerCase() === cleanCode && label(invitation == null ? void 0 : invitation.id, "") !== "") || null;
  }
  function primaryProfession(owner) {
    const memberships = professionMembershipRecords(owner).filter((membership) => isKProfessionCode(professionCode(membership)));
    const primary = primaryProfessionMembership(memberships);
    if (!primary) {
      return null;
    }
    const progress = optionalArray4(owner == null ? void 0 : owner.professions).find((profession) => professionCode(profession) === professionCode(primary));
    return __spreadProps(__spreadValues(__spreadValues({}, progress), primary), {
      code: professionCode(primary),
      displayName: label(primary.professionDisplayName || (progress == null ? void 0 : progress.displayName), "Profession")
    });
  }
  function professionLevelInfo(profession) {
    const xp = Math.max(0, Number((profession == null ? void 0 : profession.xp) || 0));
    const level = Math.max(1, Number((profession == null ? void 0 : profession.level) || professionLevelFromXp(xp)));
    const currentLevelXp = professionXpThresholdForLevel(level);
    const nextLevelXp = professionXpThresholdForLevel(level + 1);
    const intoLevel = Math.max(0, xp - currentLevelXp);
    const needed = Math.max(0, nextLevelXp - xp);
    const levelSpan = Math.max(1, nextLevelXp - currentLevelXp);
    return {
      xp,
      level,
      currentLevelXp,
      nextLevelXp,
      intoLevel,
      needed,
      percent: Math.max(0, Math.min(100, Math.round(intoLevel / levelSpan * 100)))
    };
  }
  function professionXpThresholdForLevel(level) {
    const cleanLevel = Math.max(1, Number(level || 1));
    if (cleanLevel <= PROFESSION_LEVEL_THRESHOLDS.length) {
      return PROFESSION_LEVEL_THRESHOLDS[cleanLevel - 1];
    }
    return PROFESSION_LEVEL_THRESHOLDS.at(-1) + (cleanLevel - PROFESSION_LEVEL_THRESHOLDS.length) * 275;
  }
  function professionLevelFromXp(xp) {
    const cleanXp = Math.max(0, Number(xp || 0));
    let level = 1;
    for (let index = 1; index < PROFESSION_LEVEL_THRESHOLDS.length; index += 1) {
      if (cleanXp >= PROFESSION_LEVEL_THRESHOLDS[index]) {
        level = index + 1;
      }
    }
    if (level === PROFESSION_LEVEL_THRESHOLDS.length) {
      const extraXp = cleanXp - PROFESSION_LEVEL_THRESHOLDS.at(-1);
      level += Math.floor(extraXp / 275);
    }
    return level;
  }
  function fallbackProfessionEntry(entry, source = "membership") {
    const code = professionCode(entry);
    if (!code) {
      return null;
    }
    return __spreadProps(__spreadValues({}, entry), {
      code,
      professionCode: code,
      displayName: label((entry == null ? void 0 : entry.professionDisplayName) || (entry == null ? void 0 : entry.displayName), humanizedCode(code, "Profession")),
      category: label(entry == null ? void 0 : entry.category, "profession"),
      description: label(entry == null ? void 0 : entry.description, source === "invitation" ? "Secondary profession invitation. Unlocking it keeps your primary profession unchanged." : "Your chosen profession. XP, recipes, crafting, and profession-only work stay here."),
      joinRule: source === "invitation" ? "invitation" : label(entry == null ? void 0 : entry.joinRule, "open"),
      visibility: label(entry == null ? void 0 : entry.visibility, "public"),
      xp: Math.max(0, Number((entry == null ? void 0 : entry.xp) || 0)),
      level: Math.max(1, Number((entry == null ? void 0 : entry.level) || 1))
    });
  }
  var fallbackPublicProfessionCatalog = [
    ["woodcutting", "Woodcutting", "gathering", "Chop and process basic wood resources.", "open", "public"],
    ["mining", "Mining", "gathering", "Mine ore veins and stone resource nodes.", "open", "public"],
    ["hunting", "Hunting", "gathering", "Track wildlife and process hides, meat, and trophies.", "open", "public"],
    ["fisherman", "Fisherman", "gathering", "Catch fish, water salvage, and shore supplies for cooks, alchemists, and traders.", "open", "public"],
    ["farming", "Farming", "gathering", "Grow and harvest crops, herbs, animal feed, and alchemy supplies.", "open", "public"],
    ["cooking", "Cooking", "crafting", "Prepare food from gathered ingredients.", "open", "public"],
    ["courier", "Courier", "service", "Move letters, parcels, and cargo between towns.", "open", "public"],
    ["healer", "Healer", "service", "Treat injuries and support recovery.", "open", "public"],
    ["guard", "Guard", "law", "Patrol, search, arrest, and protect holds.", "discord_role", "public"],
    ["smithing", "Smithing", "crafting", "Smelt, forge, repair, and improve equipment.", "open", "public"],
    ["fletcher", "Fletcher", "crafting", "Craft bows, arrows, crossbows, and archery supplies from wood, hides, and metal fittings.", "open", "public"],
    ["tailoring", "Tailoring", "crafting", "Make clothing, packs, and cloth goods.", "open", "public"],
    ["alchemy", "Alchemy", "crafting", "Create legal remedies and restricted mixtures.", "open", "public"],
    ["scribe", "Scribe", "magic", "Craft spell books and learning texts from inks, bindings, and charged soul gems.", "discord_role", "public"],
    ["enchanter", "Enchanter", "magic", "Bind known magical effects to gear with soul gems and server-owned patterns.", "discord_role", "public"]
  ].map(([code, displayName, category, description, joinRule, visibility]) => ({
    code,
    professionCode: code,
    displayName,
    category,
    description,
    joinRule,
    visibility,
    active: true,
    xp: 0,
    level: 1
  }));
  function fallbackPublicProfessions() {
    return fallbackPublicProfessionCatalog.map((profession) => __spreadValues({}, profession));
  }
  function publicProfessions(owner, options = {}) {
    const activeCodes = activeProfessionCodes(owner);
    const invitationCodes = activeProfessionInvitationCodes(owner);
    const primary = primaryProfession(owner);
    const primaryCode = professionCode(primary);
    const allowCatalogFallback = options.allowCatalogFallback === true;
    const ownerProfessionRows = optionalArray4(owner == null ? void 0 : owner.professions);
    const sourceProfessions = ownerProfessionRows.some((profession) => isKProfessionCode(professionCode(profession)) && (profession == null ? void 0 : profession.active) !== false) ? ownerProfessionRows : primary || !allowCatalogFallback ? ownerProfessionRows : fallbackPublicProfessions();
    const professions = sourceProfessions.filter((profession) => {
      const code = professionCode(profession);
      if (!isKProfessionCode(code) || (profession == null ? void 0 : profession.active) === false) {
        return false;
      }
      if ((profession == null ? void 0 : profession.visibility) === "hidden" && !activeCodes.has(code) && !invitationCodes.has(code) && code !== primaryCode) {
        return false;
      }
      return !primary || activeCodes.has(code) || invitationCodes.has(code) || code === primaryCode;
    });
    const seen = new Set(professions.map(professionCode).filter(Boolean));
    for (const membership of professionMembershipRecords(owner)) {
      const code = professionCode(membership);
      if (isKProfessionCode(code) && !seen.has(code) && (activeCodes.has(code) || code === primaryCode)) {
        professions.push(fallbackProfessionEntry(membership, "membership"));
        seen.add(code);
      }
    }
    for (const invitation of optionalArray4(owner == null ? void 0 : owner.professionInvitations)) {
      const code = professionCode(invitation);
      if (!isKProfessionCode(code) || seen.has(code) || !invitationCodes.has(code)) {
        continue;
      }
      const fallback = fallbackProfessionEntry(invitation, "invitation");
      if (fallback) {
        professions.push(fallback);
        seen.add(code);
      }
    }
    return professions;
  }
  function professionSurfaceOverview(owner) {
    if (!owner || typeof owner !== "object") {
      return owner;
    }
    const available = owner.available && typeof owner.available === "object" ? owner.available : {};
    return {
      reason: owner.reason,
      character: owner.character,
      inventory: owner.inventory,
      items: owner.items,
      spells: owner.spells,
      professionMemberships: owner.professionMemberships,
      professionInvitations: owner.professionInvitations,
      professions: publicProfessions(owner, { allowCatalogFallback: true }),
      available: {
        resourceNodes: optionalArray4(available.resourceNodes),
        businessOrders: optionalArray4(available.businessOrders),
        recipes: optionalArray4(available.recipes),
        dungeonEncounters: optionalArray4(available.dungeonEncounters),
        courierBoard: optionalArray4(available.courierBoard),
        courierDeliveries: optionalArray4(available.courierDeliveries),
        taxiContracts: optionalArray4(available.taxiContracts),
        wantedBoard: optionalArray4(available.wantedBoard),
        wantedRecords: optionalArray4(available.wantedRecords),
        medicalCalls: optionalArray4(available.medicalCalls),
        spells: optionalArray4(available.spells)
      }
    };
  }
  function professionViewStateForPayload(owner) {
    const primary = primaryProfession(owner);
    const primaryCode = label(primary == null ? void 0 : primary.code, "");
    const activeCodes = Array.from(activeProfessionCodes(owner));
    const invitationCodes = Array.from(activeProfessionInvitationCodes(owner));
    const visibleProfessionCodes = publicProfessions(owner, { allowCatalogFallback: true }).map(professionCode).filter(Boolean);
    const invitedSecondaryCodes = primaryCode ? invitationCodes.filter((code) => !activeCodes.includes(code)) : [];
    return {
      mode: primaryCode ? "profession_workspace" : "choose_primary",
      primaryProfessionCode: primaryCode || null,
      activeProfessionCodes: activeCodes,
      invitedSecondaryCodes,
      visibleProfessionCodes,
      hidesUnchosenProfessions: Boolean(primaryCode),
      secondaryUnlockAvailable: invitedSecondaryCodes.length > 0
    };
  }
  function organizationSurfaceOverview(owner, mode = "holdings") {
    if (!owner || typeof owner !== "object") {
      return owner;
    }
    const available = owner.available && typeof owner.available === "object" ? owner.available : {};
    const normalizedMode = normalizeOrganizationPanelMode(mode);
    const includeGuilds = normalizedMode === "guilds" || normalizedMode === "all";
    const includeHoldings = normalizedMode === "holdings" || normalizedMode === "all";
    return __spreadProps(__spreadValues(__spreadValues({
      reason: owner.reason,
      character: owner.character
    }, includeGuilds ? {
      guildMemberships: optionalArray4(owner.guildMemberships),
      guildAuthority: optionalArray4(owner.guildAuthority),
      guildDues: optionalArray4(owner.guildDues),
      guildContractClaims: optionalArray4(owner.guildContractClaims)
    } : {}), includeHoldings ? {
      properties: optionalArray4(owner.properties),
      propertyCharges: optionalArray4(owner.propertyCharges),
      businesses: optionalArray4(owner.businesses)
    } : {}), {
      available: __spreadValues(__spreadValues({}, includeGuilds ? {
        guilds: optionalArray4(available.guilds),
        guildContracts: optionalArray4(available.guildContracts),
        guildRosters: optionalArray4(available.guildRosters)
      } : {}), includeHoldings ? {
        purchasableProperties: optionalArray4(available.purchasableProperties),
        rentableProperties: optionalArray4(available.rentableProperties),
        propertySaleListings: optionalArray4(available.propertySaleListings),
        propertyInteractions: optionalArray4(available.propertyInteractions)
      } : {})
    });
  }
  var professionGuideCatalog = {
    woodcutting: {
      readiness: "Live E test",
      firstAction: "Choose Woodcutting, then gather firewood or sawmill logs from Riverwood resource nodes.",
      unlocks: ["Chop firewood resource nodes", "Gather sawmill logs", "Supply fuel, bows, repairs, and building stock"],
      playerDependency: "Feeds cooks, smiths, property owners, and trade stock.",
      progression: "Primary profession can master wood work. Future secondary profession is limited."
    },
    mining: {
      readiness: "Live E test",
      firstAction: "Choose Mining, then gather iron, corundum, or silver from Riverwood resource nodes.",
      unlocks: ["Mine ore resource nodes", "Feed iron and steel smelting", "Supply smiths, traders, and couriers"],
      playerDependency: "Feeds smiths, builders, crafters, and cargo haulers.",
      progression: "Primary profession can master mining. Future secondary profession is limited."
    },
    hunting: {
      readiness: "Starter node ready",
      firstAction: "Choose Hunting, then work Riverwood deer trails and traplines for meat and hides.",
      unlocks: ["Gather venison and hides", "Supply cooking and tailoring", "Level from hunting work"],
      playerDependency: "Feeds cooks, tailors, alchemists, merchants, and posted orders.",
      progression: "Primary profession can master hunting. Future secondary profession is limited."
    },
    fisherman: {
      readiness: "Server node ready",
      firstAction: "Choose Fisherman, then use Riverwood fishing spots for salmon and alchemy fish.",
      unlocks: ["Catch salmon for food supply", "Gather Histcarp and River Betty", "Supply cooks and alchemists"],
      playerDependency: "Feeds cooks, alchemists, merchants, taverns, and courier cargo.",
      progression: "Primary profession can master fishing. Future secondary profession is limited."
    },
    farming: {
      readiness: "Server node ready",
      firstAction: "Choose Farming, then harvest Riverwood crops, flowers, and berry nodes.",
      unlocks: ["Harvest crops for soups and stews", "Grow flowers and berries for alchemy", "Level from farm work"],
      playerDependency: "Feeds cooks, alchemists, taverns, merchants, and settlement stores.",
      progression: "Primary profession can master farming. Future secondary profession is limited."
    },
    cooking: {
      readiness: "Server gate ready",
      firstAction: "Cook known recipes when you have the ingredients.",
      unlocks: ["Prepare food recipes", "Pack traveler supplies", "Level from crafting food"],
      playerDependency: "Needs hunters, farmers, fishers, and traders for ingredients.",
      progression: "Primary profession can master cooking. Future secondary profession is limited."
    },
    courier: {
      readiness: "Server gate ready",
      firstAction: "Move letters, parcels, cargo, or taxi contracts when a board/dropbox route is available.",
      unlocks: ["Claim delivery contracts", "Move escrowed cargo", "Claim taxi driver contracts"],
      playerDependency: "Connects towns, businesses, guards, guilds, and player mail.",
      progression: "Primary profession can master courier work. Future secondary profession is limited."
    },
    healer: {
      readiness: "Server gate ready",
      firstAction: "Respond when another player has an active injury case.",
      unlocks: ["Treat injury cases", "Support recovery timers", "Level from medical work"],
      playerDependency: "Needed by injured players, guards, travelers, and event groups.",
      progression: "Primary profession can master healing. Future secondary profession is limited."
    },
    guard: {
      readiness: "Discord gated",
      firstAction: "Requires the approved guard role before choosing.",
      unlocks: ["Search, cuff, arrest, and process law evidence", "Resolve wanted records", "Protect territory events"],
      playerDependency: "Creates law pressure for traders, criminals, couriers, and towns.",
      progression: "Guard is whitelisted. Secondary profession rules do not bypass Discord approval."
    },
    smithing: {
      readiness: "Starter recipe ready",
      firstAction: "Choose Smithing, gather ore, then smelt ingots, forge gear, or make repair kits.",
      unlocks: ["Smelt iron, corundum, silver, and steel", "Forge starter gear", "Craft repair kits"],
      playerDependency: "Needs miners, woodcutters, couriers, merchants, and guards.",
      progression: "Primary profession can master smithing. Future secondary profession is limited."
    },
    fletcher: {
      readiness: "Starter recipe ready",
      firstAction: "Choose Fletcher, gather wood and metal, then craft bows, arrows, and fishing rods.",
      unlocks: ["Craft bows, arrows, and rods", "Use wood, leather strips, and ingots", "Supply hunters, guards, fishers, and travelers"],
      playerDependency: "Needs woodcutters, miners, tailors, hunters, traders, and guards.",
      progression: "Primary profession can master fletching. Future secondary profession is limited."
    },
    tailoring: {
      readiness: "Starter recipe ready",
      firstAction: "Choose Tailoring, tan hides into leather, cut leather strips, then craft armor pieces.",
      unlocks: ["Tan hides and pelts into leather", "Cut leather strips for other crafters", "Craft starter leather gear"],
      playerDependency: "Needs hunters, traders, couriers, and shop owners.",
      progression: "Primary profession can master tailoring. Future secondary profession is limited."
    },
    alchemy: {
      readiness: "Starter recipe ready",
      firstAction: "Choose Alchemy, then combine gathered flowers, fish, wheat, and snowberries into potions.",
      unlocks: ["Brew healing, stamina, magicka, and frost-resist potions", "Use farmer and fisherman inputs", "Support healers and explorers"],
      playerDependency: "Needs hunters, gatherers, smugglers, healers, and merchants.",
      progression: "Primary profession can master alchemy. Future secondary profession is limited."
    },
    scribe: {
      readiness: "Discord gated",
      firstAction: "Requires approval before crafting spell books from texts, bindings, and charged soul gems.",
      unlocks: ["Craft spell learning books", "Use charged soul gems for magical writing", "Supply mages and guild libraries"],
      playerDependency: "Needs enchanters, alchemists, miners, couriers, mages, and guild leaders.",
      progression: "Scribe is whitelisted so spell access remains deliberate and audited."
    },
    enchanter: {
      readiness: "Discord gated, recipe ready",
      firstAction: "After approval, craft Iron Dagger of Embers from an iron dagger and a filled petty soul gem.",
      unlocks: ["Enchant starter weapons with soul gems", "Use spider and draugr rewards for stronger patterns", "Level from gated enchanting crafts"],
      playerDependency: "Needs miners, scribes, hunters, smiths, fletchers, and traders.",
      progression: "Enchanter is whitelisted. Secondary profession rules do not bypass Discord approval or recipe level gates."
    },
    thief: {
      readiness: "Hidden",
      firstAction: "Requires invitation, hidden world hook, or staff event.",
      unlocks: ["Attempt server-owned pickpocket actions", "Build underworld reputation", "Create law evidence"],
      playerDependency: "Depends on targets, fences, smugglers, guards, and risky trade.",
      progression: "Hidden professions are invitation/event paths and remain audited."
    },
    smuggler: {
      readiness: "Hidden",
      firstAction: "Requires invitation, hidden world hook, or staff event.",
      unlocks: ["Move concealed cargo", "Risk cargo inspection", "Build underworld reputation"],
      playerDependency: "Depends on couriers, guards, thieves, merchants, and contraband buyers.",
      progression: "Hidden professions are invitation/event paths and remain audited."
    }
  };
  var professionPathCatalog = {
    woodcutting: [
      { stage: "Starter", goal: "Choose Woodcutting, gather Firewood at Riverwood, then sell fuel to the Riverwood Trade Counter." },
      { stage: "Early", goal: "Gather Sawn Logs for fletchers, smiths, repairs, traveler supplies, and property stock." },
      { stage: "Midgame", goal: "Keep steady wood contracts filled so smiths, fletchers, cooks, and builders can progress." }
    ],
    mining: [
      { stage: "Starter", goal: "Choose Mining, gather Iron Ore, and feed the first iron-ingot smelting loop." },
      { stage: "Early", goal: "Move into Corundum and Silver nodes so smiths can unlock steel and higher-value goods." },
      { stage: "Midgame", goal: "Supply standing ore demand and player smiths preparing gear for bandit and draugr encounters." }
    ],
    hunting: [
      { stage: "Starter", goal: "Choose Hunting, gather Venison and Deer Hide, then feed cooks and tailors." },
      { stage: "Early", goal: "Clear the Riverwood Wolf Den for loot, supplies, gold, and Hunting XP." },
      { stage: "Midgame", goal: "Push into spider, bandit, and draugr encounters when your group needs alchemy, guard, or enchanting rewards." }
    ],
    fisherman: [
      { stage: "Starter", goal: "Choose Fisherman and catch Salmon Meat for basic cooking." },
      { stage: "Early", goal: "Gather Histcarp and River Betty for alchemy recipes and trade-counter demand." },
      { stage: "Midgame", goal: "Coordinate with cooks and alchemists so food, stamina potions, and travel supplies stay stocked." }
    ],
    farming: [
      { stage: "Starter", goal: "Choose Farming and harvest wheat, potatoes, cabbage, leeks, and tomatoes near Riverwood." },
      { stage: "Early", goal: "Gather mountain flowers, snowberries, and tundra cotton to unlock alchemy supply chains." },
      { stage: "Midgame", goal: "Keep cooks and alchemists supplied so dungeon groups have food, healing, and resist potions." }
    ],
    cooking: [
      { stage: "Starter", goal: "Choose Cooking and make Venison Chop or Cooked Salmon from gathered ingredients." },
      { stage: "Early", goal: "Reach level 2 for Vegetable Soup and Apple Cabbage Stew, then sell food to standing orders." },
      { stage: "Midgame", goal: "Pack Traveler Supplies for dungeon rewards, courier stock, and town trade loops." }
    ],
    courier: [
      { stage: "Starter", goal: "Choose Courier, claim a starter delivery, and complete the route for gold and XP." },
      { stage: "Early", goal: "Claim taxi contracts and move player cargo between Riverwood and Whiterun." },
      { stage: "Midgame", goal: "Connect dungeon loot, crafted gear, business orders, and guild work across towns." }
    ],
    healer: [
      { stage: "Starter", goal: "Choose Healer when approved and respond to the first downed-player case." },
      { stage: "Early", goal: "Stock potions and coordinate with alchemists before dungeon or law events." },
      { stage: "Midgame", goal: "Support patrols, dungeon groups, and prisoner transport with recovery coverage." }
    ],
    guard: [
      { stage: "Starter", goal: "Get approved for Guard, then learn search, cuff, arrest, and wanted-board actions." },
      { stage: "Early", goal: "Handle contraband inspections and active wanted records around starter towns." },
      { stage: "Midgame", goal: "Clear bandit encounters and protect courier, business, and guild routes." }
    ],
    smithing: [
      { stage: "Starter", goal: "Choose Smithing, smelt Iron Ingots, and forge an Iron Dagger." },
      { stage: "Early", goal: "Reach levels 2 and 3 for repair kits, iron helmets, and steel ingots." },
      { stage: "Midgame", goal: "Forge steel gear and keep trade-counter and guard supply orders filled." }
    ],
    fletcher: [
      { stage: "Starter", goal: "Choose Fletcher, craft Long Bows or Iron Arrows from wood and ingots." },
      { stage: "Early", goal: "Reach level 2 for Hunting Bows and Fishing Rods, then supply hunters and fishers." },
      { stage: "Midgame", goal: "Reach level 3 for Steel Arrows and keep patrol and dungeon groups stocked." }
    ],
    tailoring: [
      { stage: "Starter", goal: "Choose Tailoring, tan Deer Hide or Wolf Pelt into Leather, then cut strips." },
      { stage: "Early", goal: "Craft boots and bracers at level 2, then Leather Armor at level 3." },
      { stage: "Midgame", goal: "Turn hunting and dungeon hides into armor supply for guards, couriers, and explorers." }
    ],
    alchemy: [
      { stage: "Starter", goal: "Choose Alchemy and brew Minor Healing from wheat and blue mountain flowers." },
      { stage: "Early", goal: "Reach level 2 for stamina and magicka potions using fish and flower inputs." },
      { stage: "Midgame", goal: "Prepare Resist Frost and dungeon-support potions from snowberries and rare ingredients." }
    ],
    scribe: [
      { stage: "Starter", goal: "Get approved for Scribe, then craft a Candlelight tome from books, flowers, and a soul gem." },
      { stage: "Early", goal: "Craft Flames tomes and coordinate soul-gem supply with enchanters and dungeon groups." },
      { stage: "Midgame", goal: "Build guild-library and mage supply loops without bypassing gated spell access." }
    ],
    enchanter: [
      { stage: "Starter", goal: "Get approved for Enchanter, source a filled soul gem, and enchant an Iron Dagger of Embers." },
      { stage: "Early", goal: "Coordinate with fletchers and dungeon groups to enchant Hunting Bows of Frostbite." },
      { stage: "Midgame", goal: "Use draugr-crypt rewards and alchemy supplies for stronger enchanted armor orders." }
    ]
  };
  function professionPathFor(code) {
    const cleanCode = label(code, "").toLowerCase();
    return professionPathCatalog[cleanCode] || [
      { stage: "Starter", goal: "Choose the profession and complete its first server-owned action." },
      { stage: "Early", goal: "Use gathered or crafted output in trade, business orders, or another profession loop." },
      { stage: "Midgame", goal: "Coordinate with other professions and encounter rewards for stronger gear and supplies." }
    ];
  }
  function professionGuideFor(code) {
    const cleanCode = label(code, "").toLowerCase();
    const guide = professionGuideCatalog[cleanCode] || {
      readiness: "Foundation",
      firstAction: "Do profession work when its world object, station, or player action is wired.",
      unlocks: ["Profession-only actions", "Gear upgrade inputs", "Server-owned XP"],
      playerDependency: "Designed so players need other professions for materials, services, and gear upgrades.",
      progression: "Primary profession can master its work. Future secondary profession is limited."
    };
    return __spreadProps(__spreadValues({}, guide), {
      path: professionPathFor(cleanCode)
    });
  }
  function professionGuidesForPayload(owner) {
    const guides = {};
    for (const profession of publicProfessions(owner, { allowCatalogFallback: true })) {
      const code = professionCode(profession);
      if (code) {
        guides[code] = professionGuideFor(code);
      }
    }
    return guides;
  }
  function canOpenProfessionChoice(owner, professionCodeValue) {
    const code = label(professionCodeValue, "").toLowerCase();
    if (!code || activeProfessionCodes(owner).has(code)) {
      return false;
    }
    if (primaryProfession(owner)) {
      return activeProfessionInvitationCodes(owner).has(code);
    }
    return publicProfessions(owner, { allowCatalogFallback: true }).some((profession) => professionCode(profession) === code) || activeProfessionInvitationCodes(owner).has(code);
  }
  function openProfessionContextAction(owner, professionCodeValue, source, enabled = true) {
    const profession = label(professionCodeValue, "").toLowerCase();
    if (!canOpenProfessionChoice(owner, profession)) {
      return null;
    }
    return {
      id: "open_professions",
      label: "Open Professions",
      message: { type: "rp.professions.open", source, professionCode: profession },
      enabled: Boolean(enabled)
    };
  }
  function opportunityListFor(professionOpportunities, professionCodeValue) {
    const code = label(professionCodeValue, "").toLowerCase();
    if (!code) {
      return null;
    }
    if (!professionOpportunities[code]) {
      professionOpportunities[code] = { items: [] };
    }
    return professionOpportunities[code].items;
  }
  function pushProfessionOpportunity(professionOpportunities, professionCodeValue, opportunity) {
    const list = opportunityListFor(professionOpportunities, professionCodeValue);
    if (!list || !(opportunity == null ? void 0 : opportunity.title)) {
      return;
    }
    const action = opportunity.action && typeof opportunity.action === "object" && label(opportunity.action.type, "") ? __spreadProps(__spreadValues({}, opportunity.action), {
      type: label(opportunity.action.type, ""),
      label: label(opportunity.action.label, "Open"),
      enabled: opportunity.action.enabled !== false
    }) : null;
    list.push({
      title: label(opportunity.title, "Profession Action"),
      detail: label(opportunity.detail, ""),
      status: label(opportunity.status, "info").toLowerCase(),
      action
    });
  }
  function recipeOpportunityDetail(recipe, gate, owner) {
    const outputQuantity = Number((recipe == null ? void 0 : recipe.outputQuantity) || 1);
    const outputName = label((recipe == null ? void 0 : recipe.outputDisplayName) || (recipe == null ? void 0 : recipe.outputItemCode), "item");
    const ingredients = recipeIngredientDetails(recipe, owner, 1).join(", ");
    const result = `Produces ${outputQuantity} ${outputName}`;
    const requiredLevel = recipeRequiredProfessionLevel(recipe);
    const unlock = requiredLevel > 1 ? `Requires ${recipeProfessionLabel(recipe)} level ${requiredLevel}` : "";
    const needs = gate.enabled ? "Ready" : `Needs: ${gate.reasons.join(", ")}`;
    return [result, unlock, ingredients ? `Uses ${ingredients}` : "", recipeStationHint(recipe), needs].filter(Boolean).join(" - ");
  }
  function recipeStationHint(recipe) {
    switch (label(recipe == null ? void 0 : recipe.category, "").toLowerCase()) {
      case "cooking":
        return "Use a cooking station with E";
      case "smithing":
        return "Use a forge with E";
      case "tailoring":
        return "Use a tanning or tailoring station with E";
      case "fletcher":
        return "Use a fletcher station with E";
      case "alchemy":
        return "Use an alchemy station with E";
      case "scribe":
        return "Use a scribe desk with E";
      case "enchanter":
        return "Use an enchanter table with E";
      default:
        return "Use the mapped station with E";
    }
  }
  function businessOrderProfessionCode(order) {
    const requiredProfession = label((order == null ? void 0 : order.requiredProfessionCode) || (order == null ? void 0 : order.professionCode), "").toLowerCase();
    if (requiredProfession) {
      return requiredProfession;
    }
    const itemCode = label(order == null ? void 0 : order.itemCode, "").toLowerCase();
    const category = label(order == null ? void 0 : order.category, "").toLowerCase();
    if (itemCode === "firewood") {
      return "woodcutting";
    }
    if (["leather", "leather_armor"].includes(itemCode)) {
      return "tailoring";
    }
    if (["iron_ore", "corundum_ore", "silver_ore"].includes(itemCode)) {
      return "mining";
    }
    if (["salmon_meat", "histcarp", "river_betty"].includes(itemCode)) {
      return "fisherman";
    }
    if ([
      "wheat",
      "potato",
      "cabbage",
      "leek",
      "tomato",
      "red_apple",
      "blue_mountain_flower",
      "red_mountain_flower",
      "purple_mountain_flower",
      "snowberries",
      "tundra_cotton"
    ].includes(itemCode)) {
      return "farming";
    }
    if (["iron_ingot", "steel_ingot", "iron_dagger", "iron_sword", "iron_helmet"].includes(itemCode)) {
      return "smithing";
    }
    if (["iron_arrow", "steel_arrow", "hunting_bow", "long_bow", "fishing_rod"].includes(itemCode)) {
      return "fletcher";
    }
    if (["cooked_venison", "venison_chop", "cooked_salmon", "vegetable_soup", "traveler_supplies"].includes(itemCode)) {
      return "cooking";
    }
    if (itemCode.startsWith("potion_")) {
      return "alchemy";
    }
    if (["hide", "crafting", "armor"].includes(category)) {
      return "tailoring";
    }
    if (category === "ore") {
      return "mining";
    }
    if (category.startsWith("enchanted_") || itemCode.startsWith("enchanted_")) {
      return "enchanter";
    }
    if (["metal", "weapon"].includes(category)) {
      return "smithing";
    }
    if (category === "ammo") {
      return "fletcher";
    }
    if (category === "food") {
      return "cooking";
    }
    if (["alchemy", "potion"].includes(category)) {
      return "alchemy";
    }
    return "";
  }
  function businessOrderOpportunityDetail(order, owner, canAct) {
    var _a;
    const remaining = Number((_a = order == null ? void 0 : order.quantityRemaining) != null ? _a : Math.max(0, Number((order == null ? void 0 : order.quantityRequested) || 0) - Number((order == null ? void 0 : order.quantityFulfilled) || 0)));
    const displayName = label((order == null ? void 0 : order.displayName) || (order == null ? void 0 : order.itemCode), "item");
    const owned = inventoryQuantity(owner, order == null ? void 0 : order.itemCode);
    const ownedLabel = owned === null ? "" : `Inventory: ${owned}`;
    const ready = canAct && (owned === null || owned > 0);
    return {
      detail: [
        label(order == null ? void 0 : order.businessName, "Business"),
        `Buying ${remaining} ${displayName}`,
        `${Number((order == null ? void 0 : order.unitPrice) || 0)} gold each`,
        ownedLabel,
        ready ? "Ready to sell" : `Needs: craft or carry ${displayName}`
      ].filter(Boolean).join(" - "),
      ready
    };
  }
  function professionOpportunitiesForPayload({ owner, state, canAct }) {
    var _a;
    const opportunities = {};
    for (const profession of publicProfessions(owner, { allowCatalogFallback: true })) {
      opportunityListFor(opportunities, professionCode(profession));
    }
    const visibleCodes = new Set(Object.keys(opportunities));
    const pushVisibleProfessionOpportunity = (code, opportunity) => {
      const cleanCode = label(code, "").toLowerCase();
      if (!visibleCodes.has(cleanCode)) {
        return;
      }
      pushProfessionOpportunity(opportunities, cleanCode, opportunity);
    };
    for (const resource of resourceNodeList(owner, state)) {
      const code = resourceProfessionCode(resource);
      if (!code) {
        continue;
      }
      const gate = resourceGatherGate(resource, owner, canAct);
      pushVisibleProfessionOpportunity(code, {
        title: `Gather ${resourceDisplayName(resource)}`,
        detail: [
          `Yields ${Number(resource.yieldQuantity || 1)} ${label(resource.itemDisplayName || resource.itemCode, "item")}`,
          gate.enabled ? "Ready for XP" : `Needs: ${gate.reasons.join(", ")}`
        ].filter(Boolean).join(" - "),
        status: gate.enabled ? "ready" : "locked",
        action: label(resource == null ? void 0 : resource.code, "") ? {
          type: "rp.resource.gather",
          nodeCode: resource.code,
          label: gate.enabled ? "Gather" : "Locked",
          enabled: gate.enabled
        } : null
      });
    }
    const activeSpawns = (state == null ? void 0 : state.npcSpawns) && typeof state.npcSpawns === "object" ? Object.values(state.npcSpawns) : [];
    const huntingReady = canAct && activeProfessionCodes(owner).has("hunting");
    for (const spawn of activeSpawns) {
      if (label(spawn == null ? void 0 : spawn.status, "active").toLowerCase() !== "active") {
        continue;
      }
      if (label(spawn == null ? void 0 : spawn.lootProfile, "none") === "none") {
        continue;
      }
      pushVisibleProfessionOpportunity("hunting", {
        title: `Hunt ${label(spawn.displayName || spawn.templateCode || spawn.id, "Server Wildlife")}`,
        detail: [
          label(spawn.cell, ""),
          label(spawn.lootProfile, "") ? `Loot: ${humanizedCode(spawn.lootProfile, spawn.lootProfile)}` : "",
          huntingReady ? "Ready for loot and XP" : "Needs: choose Hunting in K"
        ].filter(Boolean).join(" - "),
        status: huntingReady ? "ready" : "locked"
      });
    }
    for (const encounter of dungeonEncounterList(owner, state)) {
      const gate = dungeonEncounterGate(encounter, canAct);
      const codeValue = dungeonEncounterCode(encounter);
      pushVisibleProfessionOpportunity("hunting", {
        title: `Encounter: ${label(encounter.displayName || codeValue, "Dungeon Encounter")}`,
        detail: dungeonEncounterDetail(encounter, gate).join(" - "),
        status: gate.enabled ? "ready" : "locked",
        action: codeValue ? {
          type: "rp.dungeon.start",
          encounterCode: codeValue,
          label: gate.enabled ? "Start" : "Locked",
          enabled: gate.enabled
        } : null
      });
    }
    for (const recipe of knownRecipes(owner, state)) {
      const code = label(recipe == null ? void 0 : recipe.category, "").toLowerCase();
      if (!code) {
        continue;
      }
      const gate = recipeCraftGate(recipe, owner, canAct);
      const codeValue = recipeCode(recipe);
      pushVisibleProfessionOpportunity(code, {
        title: `Recipe: ${label(recipe.displayName || recipeCode(recipe), "Recipe")}`,
        detail: recipeOpportunityDetail(recipe, gate, owner),
        status: gate.enabled ? "ready" : "locked",
        action: codeValue ? {
          type: "rp.craft.recipe",
          recipeCode: codeValue,
          quantity: 1,
          label: gate.enabled ? "Craft" : "Locked",
          enabled: gate.enabled
        } : null
      });
    }
    for (const order of openBusinessOrders(owner, state).slice(0, 20)) {
      if (!label(order == null ? void 0 : order.createdByCharacterId, "")) {
        continue;
      }
      const code = businessOrderProfessionCode(order);
      if (!code) {
        continue;
      }
      const orderOpportunity = businessOrderOpportunityDetail(order, owner, canAct);
      const professionActive = activeProfessionCodes(owner).has(code);
      const ready = orderOpportunity.ready && professionActive;
      const remaining = Number((_a = order == null ? void 0 : order.quantityRemaining) != null ? _a : Math.max(0, Number((order == null ? void 0 : order.quantityRequested) || 0) - Number((order == null ? void 0 : order.quantityFulfilled) || 0)));
      const owned = inventoryQuantity(owner, order == null ? void 0 : order.itemCode);
      const fulfillQuantity = owned === null ? 1 : Math.max(1, Math.min(Math.max(1, remaining), owned));
      pushVisibleProfessionOpportunity(code, {
        title: `Supply ${label(order.displayName || order.itemCode, "Crafted Goods")}`,
        detail: [
          orderOpportunity.detail,
          professionActive ? "" : `Needs: choose ${humanizedCode(code, "Profession")} in K`
        ].filter(Boolean).join(" - "),
        status: ready ? "ready" : "locked",
        action: label(order == null ? void 0 : order.id, "") ? {
          type: "rp.business.order.fulfill",
          orderId: order.id,
          quantity: fulfillQuantity,
          label: ready ? "Supply" : "Locked",
          enabled: ready
        } : null
      });
    }
    const openDeliveries = courierBoardDeliveries(owner, state).filter((delivery) => !delivery.status || delivery.status === "open");
    const claimedDeliveries = claimedCourierDeliveries(owner, state).filter((delivery) => !delivery.status || delivery.status === "claimed");
    const courierReady = courierGate(owner, canAct).enabled;
    for (const delivery of openDeliveries.slice(0, 2)) {
      pushVisibleProfessionOpportunity("courier", {
        title: `Courier ${label(delivery.subject, "Delivery")}`,
        detail: [
          courierDeliveryDetail(delivery),
          courierReady ? "Ready" : `Needs: ${courierGate(owner, canAct).reasons.join(", ")}`
        ].filter(Boolean).join(" - "),
        status: courierReady ? "ready" : "locked",
        action: label(delivery == null ? void 0 : delivery.id, "") ? {
          type: "rp.courier.claim",
          deliveryId: delivery.id,
          label: courierReady ? "Claim" : "Locked",
          enabled: courierReady
        } : null
      });
    }
    for (const delivery of claimedDeliveries.slice(0, 1)) {
      pushVisibleProfessionOpportunity("courier", {
        title: `Complete ${label(delivery.subject, "Delivery")}`,
        detail: courierDeliveryDetail(delivery),
        status: canAct ? "ready" : "locked",
        action: label(delivery == null ? void 0 : delivery.id, "") ? {
          type: "rp.courier.complete",
          deliveryId: delivery.id,
          label: canAct ? "Complete" : "Locked",
          enabled: canAct
        } : null
      });
    }
    const taxiReady = courierGate(owner, canAct).enabled;
    for (const contract of openTaxiContracts(owner, state).slice(0, 2)) {
      pushVisibleProfessionOpportunity("courier", {
        title: `Taxi ${label(contract.routeName || contract.routeCode, "Fare")}`,
        detail: [
          taxiContractDetail(contract),
          taxiReady ? "Ready" : `Needs: ${courierGate(owner, canAct).reasons.join(", ")}`
        ].filter(Boolean).join(" - "),
        status: taxiReady ? "ready" : "locked",
        action: label(contract == null ? void 0 : contract.id, "") ? {
          type: "rp.taxi.claim",
          contractId: contract.id,
          label: taxiReady ? "Claim" : "Locked",
          enabled: taxiReady
        } : null
      });
    }
    const guardReady = isGuardLike(owner);
    for (const record of activeWantedRecords(owner, state).slice(0, 3)) {
      pushVisibleProfessionOpportunity("guard", {
        title: "Wanted Record",
        detail: wantedRecordDetail(record),
        status: guardReady ? "ready" : "locked"
      });
    }
    const healerReady = isHealerLike(owner);
    for (const call of activeMedicalCalls(owner, state).slice(0, 3)) {
      pushVisibleProfessionOpportunity("healer", {
        title: "Medical Call",
        detail: medicalCallDetail(call),
        status: healerReady ? "ready" : "locked"
      });
    }
    for (const list of Object.values(opportunities)) {
      list.items = list.items.slice(0, 5);
    }
    return opportunities;
  }
  function guildPowerLabels(permissions = {}) {
    const labels = [];
    if (permissions.manageMembers) {
      labels.push("Ranks");
    }
    if (permissions.manageProperty) {
      labels.push("Doors");
    }
    if (permissions.manageKeys) {
      labels.push("Keys");
    }
    if (permissions.revokeKeys) {
      labels.push("Revoke keys");
    }
    if (permissions.assignRooms) {
      labels.push("Rooms");
    }
    if (permissions.manageContracts) {
      labels.push("Contracts");
    }
    if (permissions.manageDues) {
      labels.push("Dues");
    }
    if (permissions.manageTreasury) {
      labels.push("Treasury");
    }
    if (permissions.manageContraband) {
      labels.push("Contraband");
    }
    return labels;
  }
  var guildEntryRankCodes = /* @__PURE__ */ new Set([
    "recruit",
    "whelp",
    "apprentice",
    "footpad",
    "initiate",
    "student",
    "acolyte",
    "worker",
    "contact",
    "novice",
    "petitioner",
    "thrall",
    "oathbound"
  ]);
  function guildAuthorityLabel(membership) {
    if (!membership) {
      return "";
    }
    const title = label(membership.title, humanizedCode(membership.rankCode, "Leader"));
    const guildName = label(membership.guildName || membership.guildCode, "Guild");
    return `${title} of ${guildName}`;
  }
  function guildPeerTargetDetails({
    guildManager,
    targetGuildMember,
    keyProperty,
    keyLock,
    peerPropertyKey
  }) {
    const details = [];
    if (guildManager) {
      details.push(`Guild authority: ${guildAuthorityLabel(guildManager)}`);
    }
    if (targetGuildMember) {
      details.push(`Target guild rank: ${label(targetGuildMember.title, humanizedCode(targetGuildMember.rankCode, "Member"))}`);
    } else if (guildManager) {
      details.push("Target guild rank: not a member");
    }
    if (keyProperty && keyLock) {
      const propertyName = label(keyProperty.name || keyProperty.displayName || keyProperty.id, "Property");
      const lockName = label(keyLock.displayName || keyLock.targetCode, "Door");
      details.push(peerPropertyKey ? `Key: has ${lockName} key for ${propertyName}` : `Key: no ${lockName} key for ${propertyName}`);
    }
    return details;
  }
  var organizationSectionCatalog = [
    {
      id: "leadership",
      title: "Leadership",
      summary: "Guild ranks, leader powers, rosters, and recruit authority",
      kinds: /* @__PURE__ */ new Set(["authority", "membership", "roster", "roster_member"])
    },
    {
      id: "property",
      title: "Property, Keys & Building",
      summary: "Homes, rooms, doors, locks, keys, building control, charges, and deed sales",
      kinds: /* @__PURE__ */ new Set(["holding", "property_charge", "property_sale_listing", "property_deed", "property_lease"])
    },
    {
      id: "business",
      title: "Businesses",
      summary: "Property-backed shops, stock, listings, and orders",
      kinds: /* @__PURE__ */ new Set(["business"])
    },
    {
      id: "contracts",
      title: "Dues & Contracts",
      summary: "Guild dues, claimed work, and public guild contracts",
      kinds: /* @__PURE__ */ new Set(["due", "claimed_contract", "available_contract"])
    },
    {
      id: "public",
      title: "Public Guilds",
      summary: "Visible guilds and faction information",
      kinds: /* @__PURE__ */ new Set(["public_guild"])
    }
  ];
  var organizationModeCatalog = {
    all: {
      title: "Guilds & Holdings",
      summary: "Guilds, holdings, keys, building, businesses, dues, and contracts",
      emptyText: "No guild, holding, business, key, building, due, or contract records are active yet.",
      sectionIds: null
    },
    holdings: {
      title: "Holdings",
      summary: "Homes, keys, businesses, building, property charges, deeds, leases, and deed sales",
      emptyText: "No holding, business, building, charge, deed, lease, or sale records are active yet.",
      sectionIds: /* @__PURE__ */ new Set(["property", "business"])
    },
    guilds: {
      title: "Guilds",
      summary: "Guild ranks, rosters, leader powers, dues, contracts, and keyed guild areas",
      emptyText: "No guild membership, rank, leader authority, due, or contract records are active yet.",
      sectionIds: /* @__PURE__ */ new Set(["leadership", "contracts", "public"])
    }
  };
  function normalizeOrganizationPanelMode(value) {
    const clean = label(value, "").toLowerCase();
    return Object.prototype.hasOwnProperty.call(organizationModeCatalog, clean) ? clean : "holdings";
  }
  function organizationModeAllowsSection(mode, sectionId) {
    const config = organizationModeCatalog[normalizeOrganizationPanelMode(mode)] || organizationModeCatalog.holdings;
    return !config.sectionIds || config.sectionIds.has(sectionId);
  }
  function organizationSectionIdForItem(item) {
    const kind = label(item == null ? void 0 : item.kind, "").toLowerCase();
    const section = organizationSectionCatalog.find((entry) => entry.kinds.has(kind));
    return (section == null ? void 0 : section.id) || "public";
  }
  function organizationSectionsForItems(items, mode = "all") {
    var _a;
    const grouped = new Map(organizationSectionCatalog.map((section) => [section.id, []]));
    for (const item of items) {
      const sectionId = organizationSectionIdForItem(item);
      if (!organizationModeAllowsSection(mode, sectionId)) {
        continue;
      }
      (_a = grouped.get(sectionId)) == null ? void 0 : _a.push(item);
    }
    return organizationSectionCatalog.filter((section) => organizationModeAllowsSection(mode, section.id)).map((section) => {
      var _a2;
      return {
        id: section.id,
        title: section.title,
        summary: section.summary,
        count: ((_a2 = grouped.get(section.id)) == null ? void 0 : _a2.length) || 0,
        items: grouped.get(section.id) || []
      };
    }).filter((section) => section.items.length > 0);
  }
  function guildSummaryForPayload(owner, mode = "all") {
    var _a, _b;
    const normalizedMode = normalizeOrganizationPanelMode(mode);
    const modeConfig = organizationModeCatalog[normalizedMode] || organizationModeCatalog.holdings;
    const maxItems = 16;
    const characterId = label((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id, "");
    const wallet = Number((_b = owner == null ? void 0 : owner.character) == null ? void 0 : _b.wallet);
    const walletKnown = Number.isFinite(wallet);
    const memberships = optionalArray4(owner == null ? void 0 : owner.guildMemberships).filter((membership) => (membership == null ? void 0 : membership.status) === void 0 || membership.status === "active");
    const authorities = optionalArray4(owner == null ? void 0 : owner.guildAuthority);
    const openDues = optionalArray4(owner == null ? void 0 : owner.guildDues).filter((due) => (due == null ? void 0 : due.status) === void 0 || due.status === "open");
    const claimedContracts = optionalArray4(owner == null ? void 0 : owner.guildContractClaims).filter((claim) => (claim == null ? void 0 : claim.status) === void 0 || claim.status === "claimed");
    const available = (owner == null ? void 0 : owner.available) || {};
    const availableContracts = optionalArray4(available.guildContracts).filter((contract) => (contract == null ? void 0 : contract.status) === void 0 || contract.status === "active");
    const publicGuilds = optionalArray4(available.guilds).filter((guild) => (guild == null ? void 0 : guild.status) === void 0 || guild.status === "active");
    const guildRosters = optionalArray4(available.guildRosters);
    const properties = optionalArray4(owner == null ? void 0 : owner.properties);
    const businesses = optionalArray4(owner == null ? void 0 : owner.businesses);
    const propertyCharges = optionalArray4(owner == null ? void 0 : owner.propertyCharges).filter((charge) => (charge == null ? void 0 : charge.status) === void 0 || charge.status === "open");
    const purchasableProperties = optionalArray4(available.purchasableProperties).filter((property) => (property == null ? void 0 : property.status) === void 0 || ["available", "rentable"].includes(property.status));
    const rentableProperties = optionalArray4(available.rentableProperties).filter((property) => (property == null ? void 0 : property.status) === void 0 || ["available", "rentable"].includes(property.status));
    const propertySaleListings = optionalArray4(available.propertySaleListings).filter((listing) => (listing == null ? void 0 : listing.status) === void 0 || listing.status === "active");
    const items = [];
    for (const authority of authorities.slice(0, 2)) {
      const propertyCount = Number(authority.controlledPropertyCount || optionalArray4(authority.controlledProperties).length || 0);
      const lockCount = Number(authority.controlledLockCount || optionalArray4(authority.controlledProperties).reduce((total, property) => total + Number((property == null ? void 0 : property.lockCount) || optionalArray4(property == null ? void 0 : property.locks).length || 0), 0));
      const powerLabels = guildPowerLabels(authority.permissions);
      items.push({
        kind: "authority",
        title: `Authority: ${label(authority.guildName || authority.guildCode, "Guild")}`,
        detail: [
          label(authority.title, humanizedCode(authority.rankCode, "Leader")),
          powerLabels.length > 0 ? `Powers: ${powerLabels.join(", ")}` : "",
          Number(authority.memberCount || 0) > 0 ? `${Number(authority.memberCount)} member${Number(authority.memberCount) === 1 ? "" : "s"}` : "",
          propertyCount > 0 ? `${propertyCount} property area${propertyCount === 1 ? "" : "s"}` : "",
          lockCount > 0 ? `${lockCount} door/key target${lockCount === 1 ? "" : "s"}` : "No mapped guild doors nearby"
        ].filter(Boolean).join(" - "),
        status: "ready"
      });
    }
    for (const membership of memberships.slice(0, 3)) {
      const powerLabels = guildPowerLabels(membership.permissions);
      items.push({
        kind: "membership",
        title: label(membership.guildName || membership.guildCode, "Guild Membership"),
        detail: [
          label(membership.title, humanizedCode(membership.rankCode, "Member")),
          powerLabels.length > 0 ? `Powers: ${powerLabels.join(", ")}` : "",
          membership.territoryName || membership.territoryCode || ""
        ].filter(Boolean).join(" - "),
        status: "ready"
      });
    }
    for (const property of properties.slice(0, 3)) {
      const propertyId = propertyIdValue(property);
      const lockCount = optionalArray4(property.lockStates || property.locks).length;
      const activeUpgradeCount = optionalArray4(property.upgrades || property.propertyUpgrades).filter((upgrade) => (upgrade == null ? void 0 : upgrade.status) === void 0 || upgrade.status === "active").length;
      const keyCapableLocks = optionalArray4(property.lockStates).filter((lock) => (lock == null ? void 0 : lock.canIssueKey) || (lock == null ? void 0 : lock.canRevokeKey) || (lock == null ? void 0 : lock.canChangeLock)).length;
      const propertyActions = [
        canUsePropertyStorage(property, characterId) ? {
          type: "rp.property.storage.refresh",
          propertyId,
          label: "Storage",
          enabled: Boolean(propertyId)
        } : null,
        canManageProperty(property, characterId, owner) && firstPropertyLock(property) ? {
          type: "rp.property.locks.refresh",
          propertyId,
          label: "Locks",
          enabled: Boolean(propertyId)
        } : null,
        canManageProperty(property, characterId, owner) ? {
          type: "rp.property.upgrades.refresh",
          propertyId,
          status: "active",
          label: "Building",
          enabled: Boolean(propertyId)
        } : null
      ].filter(Boolean);
      items.push({
        kind: "holding",
        title: label(property.name || property.displayName || property.id, "Holding"),
        detail: [
          label(property.role, property.ownerCharacterId ? "owned" : property.tenantCharacterId ? "rented" : ""),
          label(property.propertyType, ""),
          label(property.status, ""),
          lockCount > 0 ? `${lockCount} lock${lockCount === 1 ? "" : "s"}` : "",
          keyCapableLocks > 0 ? `${keyCapableLocks} key target${keyCapableLocks === 1 ? "" : "s"}` : "",
          activeUpgradeCount > 0 ? `${activeUpgradeCount} upgrade${activeUpgradeCount === 1 ? "" : "s"}` : ""
        ].filter(Boolean).join(" - "),
        status: propertyActions.length > 0 ? "ready" : "info",
        actions: propertyActions
      });
    }
    for (const business of businesses.slice(0, 3)) {
      const businessId = label(business.id || business.businessId, "");
      const businessActions = businessId ? [
        {
          type: "rp.business.orders.refresh",
          businessId,
          status: "active",
          label: "Orders",
          enabled: true
        },
        {
          type: "rp.business.listings.refresh",
          businessId,
          status: "active",
          label: "Listings",
          enabled: true
        }
      ] : [];
      items.push({
        kind: "business",
        title: label(business.name || business.businessName || business.id, "Business"),
        detail: [
          humanizedCode(business.type, ""),
          label(business.hold, ""),
          business.propertyName ? `Property: ${business.propertyName}` : "",
          label(business.status, "")
        ].filter(Boolean).join(" - "),
        status: businessActions.length > 0 ? "ready" : "info",
        actions: businessActions
      });
    }
    for (const charge of propertyCharges.slice(0, 3)) {
      const chargeId = label(charge.id || charge.chargeId, "");
      const dueAt = shortDateLabel(charge.dueAt);
      items.push({
        kind: "property_charge",
        title: `${humanizedCode(charge.chargeType, "Charge")}: ${label(charge.propertyName || charge.propertyId, "Property")}`,
        detail: [
          `${Number(charge.amount || 0)} gold`,
          dueAt ? `due ${dueAt}` : "",
          label(charge.notes, "")
        ].filter(Boolean).join(" - "),
        status: "locked",
        action: chargeId ? {
          type: "rp.property.charge.pay",
          chargeId,
          label: "Pay",
          enabled: true
        } : null
      });
    }
    for (const listing of propertySaleListings.slice(0, 3)) {
      const listingId = label(listing.id || listing.listingId, "");
      const sellerCharacterId = label(listing.sellerCharacterId, "");
      const buyerCharacterId = label(listing.buyerCharacterId, "");
      const isSeller = characterId && sellerCharacterId === characterId;
      const isPrivateBuyer = buyerCharacterId && buyerCharacterId === characterId;
      const price = Number(listing.askingPrice || listing.price || 0);
      const canBuy = listingId && !isSeller && (!buyerCharacterId || isPrivateBuyer) && (!walletKnown || wallet >= price);
      const saleActions = [];
      if (isSeller) {
        saleActions.push({
          type: "rp.property.saleListing.cancel",
          listingId,
          label: "Cancel",
          enabled: Boolean(listingId)
        });
      } else {
        saleActions.push({
          type: "rp.property.saleListing.buy",
          listingId,
          label: walletKnown && wallet < price ? "Need Gold" : "Buy Deed",
          enabled: Boolean(canBuy)
        });
      }
      items.push({
        kind: "property_sale_listing",
        title: `For Sale: ${label(listing.propertyName || listing.propertyId, "Property")}`,
        detail: [
          price > 0 ? `${price} gold` : "",
          listing.sellerCharacterName ? `Seller: ${listing.sellerCharacterName}` : "",
          buyerCharacterId ? `Buyer: ${label(listing.buyerCharacterName || buyerCharacterId, "private")}` : "Public listing",
          shortDateLabel(listing.expiresAt) ? `expires ${shortDateLabel(listing.expiresAt)}` : ""
        ].filter(Boolean).join(" - "),
        status: canBuy || isSeller ? "ready" : "locked",
        actions: saleActions
      });
    }
    for (const property of purchasableProperties.slice(0, 3)) {
      const propertyId = propertyIdValue(property);
      const price = Number(property.purchasePrice || property.price || 0);
      const canBuy = propertyId && price > 0 && (!walletKnown || wallet >= price);
      items.push({
        kind: "property_deed",
        title: `Deed: ${label(property.name || property.displayName || property.id, "Property")}`,
        detail: [
          price > 0 ? `${price} gold` : "",
          humanizedCode(property.propertyType, ""),
          label(property.territoryName || property.area || property.territoryCode, ""),
          property.parentPropertyName ? `Inside ${property.parentPropertyName}` : ""
        ].filter(Boolean).join(" - "),
        status: canBuy ? "ready" : "locked",
        action: propertyId ? {
          type: "rp.property.purchase",
          propertyId,
          label: walletKnown && wallet < price ? "Need Gold" : "Buy Deed",
          enabled: Boolean(canBuy)
        } : null
      });
    }
    for (const property of rentableProperties.slice(0, 3)) {
      const propertyId = propertyIdValue(property);
      const rent = Number(property.rent || property.rentGold || property.rentPrice || 0);
      const canRent = propertyId && rent > 0 && (!walletKnown || wallet >= rent);
      items.push({
        kind: "property_lease",
        title: `Lease: ${label(property.name || property.displayName || property.id, "Room")}`,
        detail: [
          rent > 0 ? `${rent} gold` : "",
          humanizedCode(property.propertyType, ""),
          label(property.territoryName || property.area || property.territoryCode, ""),
          property.parentPropertyName ? `Inside ${property.parentPropertyName}` : ""
        ].filter(Boolean).join(" - "),
        status: canRent ? "ready" : "locked",
        action: propertyId ? {
          type: "rp.property.rent",
          propertyId,
          label: walletKnown && wallet < rent ? "Need Gold" : "Rent",
          enabled: Boolean(canRent)
        } : null
      });
    }
    for (const roster of guildRosters.slice(0, 2)) {
      const rosterName = label(roster.guildName || roster.guildCode, "Guild");
      const leaderMembers = optionalArray4(roster.leaders);
      const leaders = leaderMembers.map((member) => label(member.title || member.rankCode || member.characterName, "Leader")).slice(0, 3);
      items.push({
        kind: "roster",
        title: `Roster: ${rosterName}`,
        detail: [
          `${Number(roster.memberCount || optionalArray4(roster.members).length)} active member${Number(roster.memberCount || optionalArray4(roster.members).length) === 1 ? "" : "s"}`,
          leaders.length > 0 ? `Controllers: ${leaders.join(", ")}` : ""
        ].filter(Boolean).join(" - "),
        status: "ready"
      });
      const seenMembers = /* @__PURE__ */ new Set();
      const visibleMembers = [];
      for (const member of [...leaderMembers, ...optionalArray4(roster.members)]) {
        const memberKey = label((member == null ? void 0 : member.characterId) || (member == null ? void 0 : member.accountId) || (member == null ? void 0 : member.characterName) || (member == null ? void 0 : member.displayName), "").toLowerCase();
        if (!memberKey || seenMembers.has(memberKey)) {
          continue;
        }
        seenMembers.add(memberKey);
        visibleMembers.push(member);
        if (visibleMembers.length >= 4) {
          break;
        }
      }
      for (const member of visibleMembers) {
        const memberName = label(member.characterName || member.displayName || member.characterId, "Member");
        const rank = label(member.title || humanizedCode(member.rankCode, ""), "Member");
        const status = label(member.status, "").toLowerCase();
        items.push({
          kind: "roster_member",
          title: `Member: ${memberName}`,
          detail: [
            rosterName,
            rank,
            status && status !== "active" ? humanizedCode(status, "") : ""
          ].filter(Boolean).join(" - "),
          status: status && status !== "active" ? "locked" : "info"
        });
      }
    }
    for (const due of openDues.slice(0, 3)) {
      const dueAt = shortDateLabel(due.dueAt);
      items.push({
        kind: "due",
        title: `Due: ${label(due.guildName || due.guildCode, "Guild")}`,
        detail: [
          `${Number(due.amount || 0)} gold`,
          dueAt ? `due ${dueAt}` : "",
          label(due.reason, "")
        ].filter(Boolean).join(" - "),
        status: "locked",
        action: due.id ? {
          type: "rp.guild.due.pay",
          dueId: due.id,
          label: "Pay",
          enabled: true
        } : null
      });
    }
    for (const claim of claimedContracts.slice(0, 3)) {
      items.push({
        kind: "claimed_contract",
        title: `Active: ${label(claim.contractTitle || claim.contractCode, "Guild Contract")}`,
        detail: [
          label(claim.guildName || claim.guildCode, "Guild"),
          Number(claim.rewardGold || 0) > 0 ? `${Number(claim.rewardGold)} gold reward` : ""
        ].filter(Boolean).join(" - "),
        status: "ready",
        action: claim.id ? {
          type: "rp.guild.contract.complete",
          claimId: claim.id,
          label: "Complete",
          enabled: true
        } : null
      });
    }
    for (const contract of availableContracts.slice(0, 3)) {
      const contractId = label(contract.id || contract.code, "");
      items.push({
        kind: "available_contract",
        title: `Available: ${label(contract.title || contract.code, "Guild Contract")}`,
        detail: [
          label(contract.guildName || contract.guildCode, "Guild"),
          humanizedCode(contract.category, ""),
          Number(contract.rewardGold || 0) > 0 ? `${Number(contract.rewardGold)} gold reward` : ""
        ].filter(Boolean).join(" - "),
        status: "info",
        action: contractId ? {
          type: "rp.guild.contract.claim",
          contractId,
          label: "Claim",
          enabled: true
        } : null
      });
    }
    if (items.length < maxItems) {
      for (const guild of publicGuilds.slice(0, maxItems - items.length)) {
        items.push({
          kind: "public_guild",
          title: label(guild.name || guild.code, "Guild"),
          detail: [
            humanizedCode(guild.type, "Guild"),
            guild.territoryName || guild.territoryCode || ""
          ].filter(Boolean).join(" - "),
          status: "info"
        });
      }
    }
    const visibleItems = items.filter((item) => organizationModeAllowsSection(normalizedMode, organizationSectionIdForItem(item))).slice(0, maxItems);
    const holdingsMode = normalizedMode === "holdings";
    const guildsMode = normalizedMode === "guilds";
    return {
      mode: normalizedMode,
      title: modeConfig.title,
      summary: modeConfig.summary,
      emptyText: modeConfig.emptyText,
      membershipCount: holdingsMode ? 0 : memberships.length,
      authorityCount: holdingsMode ? 0 : authorities.length,
      propertyCount: guildsMode ? 0 : properties.length,
      businessCount: guildsMode ? 0 : businesses.length,
      propertyChargeCount: guildsMode ? 0 : propertyCharges.length,
      propertyOfferCount: guildsMode ? 0 : purchasableProperties.length,
      rentalOfferCount: guildsMode ? 0 : rentableProperties.length,
      propertySaleListingCount: guildsMode ? 0 : propertySaleListings.length,
      leaderPowerCount: holdingsMode ? 0 : memberships.filter((membership) => guildPowerLabels(membership.permissions).length > 0).length,
      openDueCount: holdingsMode ? 0 : openDues.length,
      claimedContractCount: holdingsMode ? 0 : claimedContracts.length,
      availableContractCount: holdingsMode ? 0 : availableContracts.length,
      rosterCount: holdingsMode ? 0 : guildRosters.length,
      publicGuildCount: holdingsMode ? 0 : publicGuilds.length,
      sections: organizationSectionsForItems(visibleItems, normalizedMode),
      items: visibleItems
    };
  }
  function recordHasStatus(record, allowedStatuses) {
    const status = label(record == null ? void 0 : record.status, "").toLowerCase();
    return !status || allowedStatuses.has(status);
  }
  function hasActiveRecord(records, allowedStatuses) {
    return optionalArray4(records).some((record) => recordHasStatus(record, allowedStatuses));
  }
  function hasOrganizationPanelAccess(owner, mode = "all") {
    const available = (owner == null ? void 0 : owner.available) || {};
    const normalizedMode = normalizeOrganizationPanelMode(mode);
    const guildAccess = hasActiveRecord(owner == null ? void 0 : owner.guildMemberships, /* @__PURE__ */ new Set(["active"])) || hasActiveRecord(owner == null ? void 0 : owner.guildAuthority, /* @__PURE__ */ new Set(["active"])) || hasActiveRecord(owner == null ? void 0 : owner.guildDues, /* @__PURE__ */ new Set(["open"])) || hasActiveRecord(owner == null ? void 0 : owner.guildContractClaims, /* @__PURE__ */ new Set(["claimed"])) || hasActiveRecord(available.guildRosters, /* @__PURE__ */ new Set(["active"]));
    const holdingsAccess = hasActiveRecord(owner == null ? void 0 : owner.properties, /* @__PURE__ */ new Set(["owned", "rentable", "rented", "leased", "active"])) || hasActiveRecord(owner == null ? void 0 : owner.propertyCharges, /* @__PURE__ */ new Set(["open"])) || hasActiveRecord(owner == null ? void 0 : owner.businesses, /* @__PURE__ */ new Set(["active", "open"])) || hasActiveRecord(available.purchasableProperties, /* @__PURE__ */ new Set(["available", "rentable"])) || hasActiveRecord(available.rentableProperties, /* @__PURE__ */ new Set(["available", "rentable"])) || hasActiveRecord(available.propertySaleListings, /* @__PURE__ */ new Set(["active"]));
    if (normalizedMode === "guilds") {
      return guildAccess;
    }
    if (normalizedMode === "holdings") {
      return holdingsAccess;
    }
    return guildAccess || holdingsAccess;
  }
  function openHoldingsContextAction(owner, source, enabled = true) {
    if (!hasOrganizationPanelAccess(owner, "holdings")) {
      return null;
    }
    return {
      id: "open_holdings",
      label: "Open Holdings",
      message: { type: "rp.organizations.open", source, mode: "holdings" },
      enabled: Boolean(enabled)
    };
  }
  function ownerHasAnyCode(owner, codes) {
    const ownedCodes = ownerCodeSet(owner);
    return codes.some((code) => ownedCodes.has(code));
  }
  function isGuardLike(owner) {
    return ownerHasAnyCode(owner, [
      "admin",
      "moderator",
      "guard",
      "whitelisted_guard",
      "town_guard",
      "hold_guard",
      "law_enforcement"
    ]);
  }
  function isHealerLike(owner) {
    return ownerHasAnyCode(owner, [
      "admin",
      "moderator",
      "healer",
      "medic",
      "physician",
      "priest_healer",
      "temple_healer"
    ]);
  }
  function isUnderworldLike(owner) {
    return ownerHasAnyCode(owner, ["thief", "smuggler", "criminal", "bandit", "assassin", "skooma"]);
  }
  function boardLabel(boardCode) {
    if (label(boardCode, "") === "riverwood_job_board") {
      return "Riverwood Town Notices";
    }
    const text5 = label(boardCode, "Town Notices").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    return text5.endsWith("Board") ? text5 : `${text5} Board`;
  }
  function noticeBoardDisplayLabel(noticeBoard, boardCode) {
    const code = label(boardCode || (noticeBoard == null ? void 0 : noticeBoard.code), "");
    if (code === "riverwood_job_board") {
      return boardLabel(code);
    }
    return noticeBoard ? label(noticeBoard.displayName || noticeBoard.code, boardLabel(code)) : boardLabel(code);
  }
  function noticeBoardDetail(post) {
    const title = label(post.title, "Notice");
    const author = label(post.authorCharacterName, "");
    return author ? `${title} by ${author}` : title;
  }
  function auctionBidAmount(lot) {
    return Math.max(
      1,
      Number((lot == null ? void 0 : lot.minimumBid) || 0),
      Number((lot == null ? void 0 : lot.winningBid) || 0) + 1
    );
  }
  function storageAuctionDetail(lot) {
    const title = label((lot == null ? void 0 : lot.title) || (lot == null ? void 0 : lot.propertyName), "Storage Lot");
    const bid = Number((lot == null ? void 0 : lot.winningBid) || 0);
    const nextBid = auctionBidAmount(lot);
    return bid > 0 ? `${title} - leading bid ${bid}` : `${title} - opens at ${nextBid}`;
  }
  function storageAuctionEventDetail(event) {
    var _a, _b;
    const title = label(event == null ? void 0 : event.title, "Storage Wars");
    const town = label(event == null ? void 0 : event.town, "");
    const lotCount = Number((_b = (_a = event == null ? void 0 : event.openLotCount) != null ? _a : event == null ? void 0 : event.lotCount) != null ? _b : 0);
    const startsAt = shortDateLabel(event == null ? void 0 : event.startsAt);
    return [
      town ? `${title} (${town})` : title,
      lotCount > 0 ? `${lotCount} lot${lotCount === 1 ? "" : "s"}` : "",
      startsAt ? `starts ${startsAt}` : ""
    ].filter(Boolean).join(" - ");
  }
  function shortDateLabel(value) {
    const text5 = label(value, "");
    return text5 ? text5.slice(0, 10) : "";
  }
  function propertyRecoveryDeadlineLabel(recoveryCase) {
    const pickupDeadline = shortDateLabel(recoveryCase == null ? void 0 : recoveryCase.pickupDeadlineAt);
    if (pickupDeadline) {
      return `Pickup by ${pickupDeadline}`;
    }
    const auctionEligible = shortDateLabel(recoveryCase == null ? void 0 : recoveryCase.auctionEligibleAt);
    if (auctionEligible) {
      return `Auction after ${auctionEligible}`;
    }
    const saleEligible = shortDateLabel(recoveryCase == null ? void 0 : recoveryCase.saleEligibleAt);
    if (saleEligible) {
      return `Sale after ${saleEligible}`;
    }
    return "";
  }
  function propertyRecoveryStorageLabel(recoveryCase) {
    const quantity = Number((recoveryCase == null ? void 0 : recoveryCase.storageQuantity) || 0);
    const itemCount = Number((recoveryCase == null ? void 0 : recoveryCase.storageItemCount) || 0);
    if (quantity > 0) {
      return `Storage: ${quantity} item${quantity === 1 ? "" : "s"}`;
    }
    if (itemCount > 0) {
      return `Storage: ${itemCount} stack${itemCount === 1 ? "" : "s"}`;
    }
    return "Storage: empty or unreported";
  }
  function firstOpenPropertyRecoveryCase(cases) {
    return cases.find((recoveryCase) => ["pickup", "recovery"].includes(label(recoveryCase == null ? void 0 : recoveryCase.status, "").toLowerCase())) || cases.find((recoveryCase) => label(recoveryCase == null ? void 0 : recoveryCase.status, "").toLowerCase() === "auction_ready") || cases[0] || null;
  }
  function resourceStateLabel(resource) {
    if (!resource) {
      return "";
    }
    if (resource.state && resource.state !== "available") {
      return `State: ${resource.state}`;
    }
    const yieldQuantity = Number(resource.yieldQuantity || 0);
    const item = label(resource.itemDisplayName || resource.itemCode, "");
    if (yieldQuantity > 0 && item) {
      return `Yields ${yieldQuantity} ${item}`;
    }
    return "Available";
  }
  function propertyRentLabel(property) {
    var _a, _b, _c;
    const rent = Number((_c = (_b = (_a = property == null ? void 0 : property.rentAmount) != null ? _a : property == null ? void 0 : property.rent) != null ? _b : property == null ? void 0 : property.price) != null ? _c : 0);
    return rent > 0 ? `Rent: ${rent} gold` : "Rent uses Skyrim gold";
  }
  function propertyPurchaseLabel(property) {
    var _a, _b;
    const price = Number((_b = (_a = property == null ? void 0 : property.purchasePrice) != null ? _a : property == null ? void 0 : property.price) != null ? _b : 0);
    return price > 0 ? `Price: ${price} gold` : "Not listed for purchase";
  }
  function firstPropertyLock(property) {
    return optionalArray4(property == null ? void 0 : property.locks).find((lock) => label(lock == null ? void 0 : lock.targetCode, "")) || null;
  }
  function firstInventoryItem(owner) {
    return optionalArray4(owner == null ? void 0 : owner.inventory).find((item) => label((item == null ? void 0 : item.itemCode) || (item == null ? void 0 : item.code), "") && Number((item == null ? void 0 : item.quantity) || 0) > 0) || null;
  }
  function inventoryLists(owner) {
    return [
      ...optionalArray4(owner == null ? void 0 : owner.inventory),
      ...optionalArray4(owner == null ? void 0 : owner.items)
    ];
  }
  function inventoryKnown(owner) {
    return Array.isArray(owner == null ? void 0 : owner.inventory) || Array.isArray(owner == null ? void 0 : owner.items);
  }
  function inventoryContains(owner, itemCode) {
    const code = label(itemCode, "").toLowerCase();
    if (!code) {
      return true;
    }
    const items = inventoryLists(owner);
    if (!inventoryKnown(owner)) {
      return null;
    }
    return items.some((item) => label((item == null ? void 0 : item.itemCode) || (item == null ? void 0 : item.code), "").toLowerCase() === code && Number((item == null ? void 0 : item.quantity) || 0) > 0);
  }
  function inventoryQuantity(owner, itemCode) {
    const code = label(itemCode, "").toLowerCase();
    if (!code) {
      return 0;
    }
    const items = inventoryLists(owner);
    if (!inventoryKnown(owner)) {
      return null;
    }
    return items.reduce((sum, item) => label((item == null ? void 0 : item.itemCode) || (item == null ? void 0 : item.code), "").toLowerCase() === code ? sum + Math.max(0, Number((item == null ? void 0 : item.quantity) || 0)) : sum, 0);
  }
  function resourceProfessionCode(resource) {
    return label((resource == null ? void 0 : resource.requiredProfessionCode) || (resource == null ? void 0 : resource.resourceType), "").toLowerCase();
  }
  function dungeonEncounterCode(encounter) {
    return label((encounter == null ? void 0 : encounter.code) || (encounter == null ? void 0 : encounter.encounterCode), "").toLowerCase();
  }
  function dungeonEncounterList(owner, state = {}) {
    var _a;
    return uniqueRecords([
      ...optionalArray4((_a = owner == null ? void 0 : owner.available) == null ? void 0 : _a.dungeonEncounters),
      ...optionalArray4(owner == null ? void 0 : owner.dungeonEncounters),
      ...optionalArray4(state == null ? void 0 : state.dungeonEncounters)
    ]).filter((encounter) => dungeonEncounterCode(encounter));
  }
  function dungeonEncounterForAnchor(owner, state, anchorCode) {
    const cleanAnchor = label(anchorCode, "").toLowerCase();
    if (!cleanAnchor) {
      return null;
    }
    return dungeonEncounterList(owner, state).find((encounter) => dungeonEncounterCode(encounter) === cleanAnchor || label(encounter == null ? void 0 : encounter.worldReferenceCode, "").toLowerCase() === cleanAnchor) || null;
  }
  function dungeonEncounterGate(encounter, canAct) {
    const reasons = [];
    const state = label(encounter == null ? void 0 : encounter.state, "ready").toLowerCase();
    const activeSpawnCount = Number((encounter == null ? void 0 : encounter.activeSpawnCount) || 0);
    if (!canAct) {
      reasons.push("join the server");
    }
    if ((encounter == null ? void 0 : encounter.active) === false || state === "inactive") {
      reasons.push("encounter is inactive");
    }
    if (activeSpawnCount > 0 || state === "active") {
      reasons.push("clear the active encounter spawns");
    }
    if ((encounter == null ? void 0 : encounter.cooldownActive) === true || state === "cooldown") {
      const cooldownUntil = shortDateLabel(encounter == null ? void 0 : encounter.cooldownUntil);
      reasons.push(cooldownUntil ? `cooling down until ${cooldownUntil}` : "encounter is cooling down");
    }
    return {
      enabled: reasons.length === 0,
      reasons
    };
  }
  function dungeonEncounterDetail(encounter, gate) {
    const tier = label(encounter == null ? void 0 : encounter.tier, "starter");
    const recommendedLevel = Number((encounter == null ? void 0 : encounter.recommendedLevel) || 1);
    const cooldownSeconds = Number((encounter == null ? void 0 : encounter.cooldownSeconds) || 0);
    const spawnCount = Number((encounter == null ? void 0 : encounter.spawnCount) || optionalArray4(encounter == null ? void 0 : encounter.spawns).length || 0);
    const reward = (encounter == null ? void 0 : encounter.completionReward) || {};
    const rewardParts = [
      Number(reward.gold || 0) > 0 ? `${Number(reward.gold)} gold` : "",
      reward.itemCode && Number(reward.itemQuantity || 0) > 0 ? `${Number(reward.itemQuantity)} ${label(reward.itemDisplayName || reward.itemCode, "item")}` : "",
      reward.professionCode && Number(reward.xp || 0) > 0 ? `${Number(reward.xp)} ${label(reward.professionDisplayName || reward.professionCode, "Profession")} XP` : ""
    ].filter(Boolean);
    return [
      `Tier: ${humanizedCode(tier, tier)}`,
      `Recommended level ${recommendedLevel}`,
      spawnCount > 0 ? `${spawnCount} spawn${spawnCount === 1 ? "" : "s"}` : "",
      rewardParts.length > 0 ? `Clear reward: ${rewardParts.join(", ")}` : "",
      cooldownSeconds > 0 ? `Cooldown ${compactSeconds(cooldownSeconds)}` : "",
      label(encounter == null ? void 0 : encounter.cell, ""),
      "Hunting profession can skin loot and XP after kills",
      gate.enabled ? "Ready to start" : `Needs: ${gate.reasons.join(", ")}`
    ].filter(Boolean);
  }
  function resourceProfessionLabel(resource) {
    const code = resourceProfessionCode(resource);
    return label((resource == null ? void 0 : resource.professionDisplayName) || (resource == null ? void 0 : resource.resourceTypeDisplayName), humanizedCode(code, "Profession"));
  }
  function resourceToolLabel(resource) {
    return label(resource == null ? void 0 : resource.requiredToolDisplayName, humanizedCode(resource == null ? void 0 : resource.requiredToolCode, (resource == null ? void 0 : resource.requiredToolCode) || "Tool"));
  }
  function resourceGatherGate(resource, owner, canAct) {
    const reasons = [];
    const state = label(resource == null ? void 0 : resource.state, "available").toLowerCase();
    const profession = resourceProfessionCode(resource);
    const toolCode = label(resource == null ? void 0 : resource.requiredToolCode, "");
    const ownsTool = inventoryContains(owner, toolCode);
    const canChooseProfession = profession && (!primaryProfession(owner) || activeProfessionInvitationCodes(owner).has(profession));
    if (!canAct) {
      reasons.push("join the server");
    }
    if (state && state !== "available") {
      reasons.push(state === "depleted" ? "resource is depleted" : `resource is ${state}`);
    }
    if (profession && !activeProfessionCodes(owner).has(profession)) {
      reasons.push(canChooseProfession ? `choose ${resourceProfessionLabel(resource)} in K` : `requires ${resourceProfessionLabel(resource)} profession`);
    }
    if (toolCode && ownsTool === false) {
      reasons.push(`missing ${resourceToolLabel(resource)}`);
    }
    return {
      enabled: reasons.length === 0,
      reasons
    };
  }
  function resourceContextDetails(resource, owner, gate) {
    const profession = resourceProfessionCode(resource);
    const toolCode = label(resource == null ? void 0 : resource.requiredToolCode, "");
    const toolStatus = inventoryContains(owner, toolCode);
    const professionActive = activeProfessionCodes(owner).has(profession);
    const canChooseProfession = profession && (!primaryProfession(owner) || activeProfessionInvitationCodes(owner).has(profession));
    const details = [resourceStateLabel(resource)];
    if (profession) {
      details.push(`Profession: ${resourceProfessionLabel(resource)}${professionActive ? " (chosen)" : canChooseProfession ? " (choose in K)" : " (not chosen)"}`);
    }
    if (toolCode) {
      const status = toolStatus === true ? " (owned)" : toolStatus === false ? " (missing)" : "";
      details.push(`Tool: ${resourceToolLabel(resource)}${status}`);
    }
    details.push(gate.enabled ? "Ready: gathers materials and profession XP" : `Needs: ${gate.reasons.join(", ")}`);
    return details.filter(Boolean);
  }
  function wantedRecords(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.wantedBoard),
      ...optionalArray4(owner == null ? void 0 : owner.wantedBoard),
      ...optionalArray4(state.wantedBoard)
    ]);
  }
  function activeWantedRecords(owner, state = {}) {
    return wantedRecords(owner, state).filter((record) => {
      const status = label(record == null ? void 0 : record.status, "active").toLowerCase();
      return status === "active" || status === "open";
    });
  }
  function wantedRecordDetail(record) {
    if (!record) {
      return "";
    }
    const subject = label(
      record.characterName || record.suspectCharacterName || record.suspectName || record.targetName || record.characterId || record.suspectCharacterId,
      "Unknown suspect"
    );
    const crime = humanizedCode(record.crimeType || record.reportCrimeType || record.type, "Wanted");
    const hold = label(record.hold, "");
    const severity = label(record.severity || record.reportSeverity, "");
    const bounty = Number(record.bountyGold || record.bounty || record.fineGold || 0);
    return [
      subject,
      crime,
      severity,
      hold,
      bounty > 0 ? `${bounty} gold` : ""
    ].filter(Boolean).join(" - ");
  }
  function compactSeconds(seconds) {
    const value = Math.max(0, Number(seconds || 0));
    if (value >= 3600) {
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor(value % 3600 / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (value >= 60) {
      return `${Math.ceil(value / 60)}m`;
    }
    return `${value}s`;
  }
  function jailTasks(owner, state = {}) {
    return uniqueRecords([
      ...optionalArray4(owner == null ? void 0 : owner.jailTasks),
      ...optionalArray4(state.jailTasks)
    ]);
  }
  function assignedJailTasks(owner, state = {}) {
    return jailTasks(owner, state).filter((task) => {
      const status = label(task == null ? void 0 : task.status, "assigned").toLowerCase();
      return status === "assigned" || status === "open";
    });
  }
  function firstAssignedJailTask(owner, state = {}) {
    var _a;
    const activeSentenceId = label((_a = owner == null ? void 0 : owner.activeJailSentence) == null ? void 0 : _a.id, "");
    const tasks = assignedJailTasks(owner, state);
    return tasks.find((task) => activeSentenceId && label(task == null ? void 0 : task.sentenceId, "") === activeSentenceId) || tasks[0] || null;
  }
  function jailSentenceDetail(sentence) {
    if (!sentence) {
      return "";
    }
    const hold = label(sentence.hold, "");
    const reason = humanizedCode(sentence.reason || sentence.crimeType, "Jail sentence");
    const jailSeconds = Number(sentence.jailSeconds || 0);
    const creditedSeconds = Number(sentence.creditedSeconds || 0);
    return [
      reason,
      hold,
      jailSeconds > 0 ? `${compactSeconds(jailSeconds)} sentence` : "",
      creditedSeconds > 0 ? `${compactSeconds(creditedSeconds)} credited` : ""
    ].filter(Boolean).join(" - ");
  }
  function jailTaskDetail(task) {
    if (!task) {
      return "";
    }
    const creditSeconds = Number(task.creditSeconds || 0);
    return [
      label(task.taskName || task.displayName || task.taskCode, "Jail Task"),
      label(task.taskDescription || task.description, ""),
      creditSeconds > 0 ? `${compactSeconds(creditSeconds)} credit` : ""
    ].filter(Boolean).join(" - ");
  }
  function createGuardPostContextPayload({ owner, state, canAct, anchorCode = "" }) {
    const cleanAnchor = label(anchorCode, "");
    const jailMarker = cleanAnchor === "riverwood_jail_marker";
    const activeWanted = activeWantedRecords(owner, state);
    const allWanted = wantedRecords(owner, state);
    const firstWanted = activeWanted[0] || allWanted[0] || null;
    const guardReady = isGuardLike(owner);
    const professionAction = !guardReady && !jailMarker ? openProfessionContextAction(owner, "guard", "law_gate", canAct) : null;
    const activeJailSentence = (owner == null ? void 0 : owner.activeJailSentence) || null;
    const openJailTasks = assignedJailTasks(owner, state);
    const firstJailTask = firstAssignedJailTask(owner, state);
    if (!cleanAnchor && !guardReady && allWanted.length === 0 && !activeJailSentence && openJailTasks.length === 0) {
      return { target: null, actions: [] };
    }
    return {
      target: {
        type: "law",
        id: cleanAnchor || "wanted_board",
        label: jailMarker ? "Riverwood Jail Marker" : "Riverwood Guard Post",
        details: [
          jailMarker ? `${openJailTasks.length} assigned jail task${openJailTasks.length === 1 ? "" : "s"}` : `${activeWanted.length} active wanted record${activeWanted.length === 1 ? "" : "s"}`,
          jailMarker && activeJailSentence ? jailSentenceDetail(activeJailSentence) : "",
          jailMarker && firstJailTask ? jailTaskDetail(firstJailTask) : "",
          jailMarker && !firstJailTask ? "No jail labor assigned. Wait for guard or staff assignment." : "",
          !jailMarker ? `Guard access: ${guardReady ? "active" : "report only"}` : "",
          !jailMarker && firstWanted ? wantedRecordDetail(firstWanted) : "",
          !jailMarker ? guardReady ? "Use X on a player for search, cuff, and arrest." : "Guard enforcement requires the guard role." : "Complete assigned jail labor here to reduce sentence time."
        ].filter(Boolean)
      },
      actions: [
        {
          id: "refresh_wanted",
          label: "Refresh Wanted",
          message: { type: "rp.wanted.refresh", hold: "Whiterun" },
          enabled: canAct
        },
        ...professionAction ? [professionAction] : [],
        ...jailMarker ? [
          {
            id: "refresh_jail_tasks",
            label: "Refresh Labor",
            message: { type: "rp.jail.tasks.refresh", status: "assigned" },
            enabled: canAct
          },
          {
            id: firstJailTask ? `complete_jail_task:${firstJailTask.id}` : "complete_jail_task",
            label: firstJailTask ? `Complete ${label(firstJailTask.taskName || firstJailTask.taskCode, "Labor")}` : "Complete Labor",
            message: {
              type: "rp.jail.task.complete",
              taskId: firstJailTask == null ? void 0 : firstJailTask.id
            },
            textPrompt: "Labor note",
            enabled: canAct && Boolean(firstJailTask == null ? void 0 : firstJailTask.id)
          }
        ] : [],
        {
          id: "report_crime",
          label: "Report Incident",
          message: {
            type: "rp.crime.report",
            hold: "Whiterun",
            crimeType: "disturbance",
            severity: "minor"
          },
          requiresText: true,
          textPrompt: "Describe incident",
          enabled: canAct
        }
      ]
    };
  }
  function medicalCalls(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.medicalCalls),
      ...optionalArray4(owner == null ? void 0 : owner.medicalCalls),
      ...optionalArray4(state.medicalCalls)
    ]);
  }
  function activeMedicalCalls(owner, state = {}) {
    return medicalCalls(owner, state).filter((record) => label(record == null ? void 0 : record.status, "downed").toLowerCase() === "downed");
  }
  function medicalCallDetail(call) {
    if (!call) {
      return "";
    }
    const patient = label(call.characterName || call.patientName || call.characterId, "Unknown patient");
    const injury = humanizedCode(call.injuryType || call.type, "Injury");
    const severity = label(call.severity, "");
    const location = label(call.cell || call.hold || call.worldspace, "");
    return [
      patient,
      injury,
      severity,
      location
    ].filter(Boolean).join(" - ");
  }
  function healerGate(owner, canAct) {
    const reasons = [];
    if (!canAct) {
      reasons.push("join the server");
    }
    if (!isHealerLike(owner)) {
      reasons.push("choose Healer in K");
    }
    return {
      enabled: reasons.length === 0,
      reasons
    };
  }
  function createMedicalContextPayload({ owner, state, canAct, anchorCode = "" }) {
    const cleanAnchor = label(anchorCode, "");
    const activeCalls = activeMedicalCalls(owner, state);
    const calls = medicalCalls(owner, state);
    const call = activeCalls[0] || calls[0] || null;
    const gate = healerGate(owner, canAct);
    const activeInjury = (owner == null ? void 0 : owner.activeInjury) || null;
    const professionAction = !isHealerLike(owner) ? openProfessionContextAction(owner, "healer", "medical_gate", canAct) : null;
    if (!cleanAnchor && !activeInjury && calls.length === 0 && !isHealerLike(owner)) {
      return { target: null, actions: [] };
    }
    return {
      target: {
        type: "medical",
        id: cleanAnchor || "medical_calls",
        label: cleanAnchor ? "Healer Station" : "Medical Calls",
        details: [
          `${activeCalls.length} active medical call${activeCalls.length === 1 ? "" : "s"}`,
          `Healer access: ${isHealerLike(owner) ? "active" : "choose Healer in K"}`,
          activeInjury ? `Your injury: ${medicalCallDetail(activeInjury)}` : "",
          call ? medicalCallDetail(call) : "",
          gate.enabled ? "Ready: treat active injury cases" : `Needs: ${gate.reasons.join(", ")}`
        ].filter(Boolean)
      },
      actions: [
        {
          id: "refresh_medical",
          label: "Refresh Calls",
          message: { type: "rp.medical.refresh", status: "downed" },
          enabled: canAct
        },
        ...professionAction ? [professionAction] : [],
        {
          id: call ? `treat_injury:${call.id}` : "treat_injury",
          label: call ? `Treat ${label(call.characterName || call.patientName, "Patient")}` : "Treat Injury",
          message: {
            type: "rp.injury.treat",
            injuryId: (call == null ? void 0 : call.id) || ""
          },
          textPrompt: "Treatment notes",
          enabled: gate.enabled && Boolean(call == null ? void 0 : call.id)
        },
        {
          id: "report_injury",
          label: activeInjury ? "Healer Called" : "Call Healer",
          message: { type: "rp.injury.report" },
          enabled: canAct && !activeInjury
        }
      ]
    };
  }
  function uniqueRecords(records) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const record of records) {
      const id = label((record == null ? void 0 : record.id) || (record == null ? void 0 : record.code), "");
      const key = id || JSON.stringify(record);
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(record);
    }
    return result;
  }
  function courierBoardDeliveries(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.courierBoard),
      ...optionalArray4(available.courierDeliveries),
      ...optionalArray4(state.courierBoard)
    ]);
  }
  function claimedCourierDeliveries(owner, state = {}) {
    return uniqueRecords([
      ...optionalArray4(owner == null ? void 0 : owner.courierDeliveries),
      ...optionalArray4(state.courierBoard).filter((delivery) => (delivery == null ? void 0 : delivery.status) === "claimed")
    ]);
  }
  function firstClaimedCourierDelivery(owner, state = {}) {
    return claimedCourierDeliveries(owner, state).find((delivery) => !delivery.status || delivery.status === "claimed") || null;
  }
  function courierDeliveryDetail(delivery) {
    if (!delivery) {
      return "";
    }
    const subject = label(delivery.subject, "Delivery");
    const pickup = label(delivery.pickupLabel, "");
    const destination = label(delivery.deliveryLabel, "");
    const reward = Number(delivery.rewardGold || 0);
    return [
      subject,
      pickup && destination ? `${pickup} to ${destination}` : "",
      reward > 0 ? `${reward} gold` : ""
    ].filter(Boolean).join(" - ");
  }
  function deliveryCountLabel(count) {
    return `${count} ${count === 1 ? "delivery" : "deliveries"}`;
  }
  function courierGate(owner, canAct) {
    const reasons = [];
    if (!canAct) {
      reasons.push("join the server");
    }
    if (!activeProfessionCodes(owner).has("courier")) {
      reasons.push("choose Courier in K");
    }
    return {
      enabled: reasons.length === 0,
      reasons
    };
  }
  function createCourierContextPayload({ owner, state, canAct, anchorCode = "" }) {
    const openDeliveries = courierBoardDeliveries(owner, state).filter((delivery) => !delivery.status || delivery.status === "open");
    const claimedDeliveries = claimedCourierDeliveries(owner, state).filter((delivery) => !delivery.status || delivery.status === "claimed");
    const openDelivery = openDeliveries[0] || null;
    const claimedDelivery = claimedDeliveries[0] || null;
    const gate = courierGate(owner, canAct);
    const cleanAnchor = label(anchorCode, "");
    const professionAction = !activeProfessionCodes(owner).has("courier") ? openProfessionContextAction(owner, "courier", "courier_gate", canAct) : null;
    if (!cleanAnchor && openDeliveries.length === 0 && claimedDeliveries.length === 0) {
      return { target: null, actions: [] };
    }
    return {
      target: {
        type: "courier",
        id: cleanAnchor || "courier",
        label: cleanAnchor === "riverwood_room_mailbox_01" ? "Room Mailbox" : "Courier Dropbox",
        details: [
          `${deliveryCountLabel(openDeliveries.length)} open`,
          `${deliveryCountLabel(claimedDeliveries.length)} claimed`,
          `Profession: Courier${activeProfessionCodes(owner).has("courier") ? " (chosen)" : " (choose in K)"}`,
          openDelivery ? courierDeliveryDetail(openDelivery) : "",
          claimedDelivery ? `Active: ${courierDeliveryDetail(claimedDelivery)}` : "",
          gate.enabled ? "Ready: claim one delivery and complete it after handoff" : `Needs: ${gate.reasons.join(", ")}`
        ].filter(Boolean)
      },
      actions: [
        {
          id: "refresh_courier",
          label: "Refresh",
          message: { type: "rp.courier.refresh" },
          enabled: canAct
        },
        ...professionAction ? [professionAction] : [],
        {
          id: openDelivery ? `claim_courier:${openDelivery.id}` : "claim_courier",
          label: openDelivery ? `Claim ${label(openDelivery.subject, "Delivery")}` : "Claim Delivery",
          message: { type: "rp.courier.claim", deliveryId: (openDelivery == null ? void 0 : openDelivery.id) || "" },
          enabled: gate.enabled && Boolean(openDelivery == null ? void 0 : openDelivery.id) && claimedDeliveries.length === 0
        },
        {
          id: claimedDelivery ? `complete_courier:${claimedDelivery.id}` : "complete_courier",
          label: claimedDelivery ? `Complete ${label(claimedDelivery.subject, "Delivery")}` : "Complete Delivery",
          message: { type: "rp.courier.complete", deliveryId: (claimedDelivery == null ? void 0 : claimedDelivery.id) || "" },
          enabled: canAct && Boolean(claimedDelivery == null ? void 0 : claimedDelivery.id)
        }
      ]
    };
  }
  function characterIdForOwner(owner, state = {}) {
    var _a, _b;
    return label(((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id) || ((_b = state == null ? void 0 : state.character) == null ? void 0 : _b.id), "");
  }
  function taxiRoutes(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.taxiRoutes),
      ...optionalArray4(state.taxiRoutes)
    ]);
  }
  function openTaxiContracts(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.taxiContracts),
      ...optionalArray4(state.taxiContracts)
    ]).filter((contract) => !contract.status || contract.status === "open");
  }
  function claimedTaxiContracts(owner, state = {}) {
    return uniqueRecords([
      ...optionalArray4(owner == null ? void 0 : owner.taxiContracts),
      ...optionalArray4(state.taxiContracts)
    ]).filter((contract) => contract.status === "claimed");
  }
  function passengerTaxiContracts(owner, state = {}) {
    const characterId = characterIdForOwner(owner, state);
    return uniqueRecords([
      ...optionalArray4(owner == null ? void 0 : owner.taxiRides),
      ...optionalArray4(state.taxiContracts).filter((contract) => characterId && (contract == null ? void 0 : contract.passengerCharacterId) === characterId)
    ]).filter((contract) => !contract.status || contract.status === "open" || contract.status === "claimed");
  }
  function firstClaimedTaxiContract(owner, state = {}) {
    return claimedTaxiContracts(owner, state)[0] || null;
  }
  function taxiRouteDetail(route) {
    if (!route) {
      return "";
    }
    const name = label(route.displayName || route.code, "Route");
    const origin = label(route.originLabel, "");
    const destination = label(route.destinationLabel, "");
    const fare = Number(route.baseFareGold || 0);
    return [
      name,
      origin && destination ? `${origin} to ${destination}` : "",
      fare > 0 ? `${fare} gold` : ""
    ].filter(Boolean).join(" - ");
  }
  function taxiContractDetail(contract) {
    if (!contract) {
      return "";
    }
    const route = label(contract.routeName || contract.routeCode, "Taxi Fare");
    const passenger = label(contract.passengerName, "");
    const fare = Number(contract.fareGold || 0);
    return [
      route,
      passenger ? `passenger ${passenger}` : "",
      fare > 0 ? `${fare} gold` : ""
    ].filter(Boolean).join(" - ");
  }
  function createTaxiContextPayload({ owner, state, canAct, anchorCode = "" }) {
    const routes = taxiRoutes(owner, state);
    const openContracts = openTaxiContracts(owner, state);
    const claimedContracts = claimedTaxiContracts(owner, state);
    const passengerContracts = passengerTaxiContracts(owner, state);
    const route = routes[0] || null;
    const openContract = openContracts[0] || null;
    const claimedContract = claimedContracts[0] || null;
    const cleanAnchor = label(anchorCode, "");
    const characterId = characterIdForOwner(owner, state);
    const driverGate = courierGate(owner, canAct);
    const ownPassengerContract = Boolean((openContract == null ? void 0 : openContract.passengerCharacterId) && openContract.passengerCharacterId === characterId);
    const professionAction = !activeProfessionCodes(owner).has("courier") ? openProfessionContextAction(owner, "courier", "taxi_gate", canAct) : null;
    if (!cleanAnchor && routes.length === 0 && openContracts.length === 0 && claimedContracts.length === 0 && passengerContracts.length === 0) {
      return { target: null, actions: [] };
    }
    return {
      target: {
        type: "taxi",
        id: cleanAnchor || "taxi",
        label: "Taxi Marker",
        details: [
          `${routes.length} route${routes.length === 1 ? "" : "s"}`,
          `${openContracts.length} open fare${openContracts.length === 1 ? "" : "s"}`,
          `${claimedContracts.length} driving`,
          passengerContracts.length > 0 ? `${passengerContracts.length} passenger request${passengerContracts.length === 1 ? "" : "s"}` : "",
          `Driver profession: Courier${activeProfessionCodes(owner).has("courier") ? " (chosen)" : " (choose in K)"}`,
          route ? taxiRouteDetail(route) : "",
          openContract ? taxiContractDetail(openContract) : "",
          claimedContract ? `Active: ${taxiContractDetail(claimedContract)}` : ""
        ].filter(Boolean)
      },
      actions: [
        {
          id: "refresh_taxi",
          label: "Refresh",
          message: { type: "rp.taxi.refresh" },
          enabled: canAct
        },
        ...professionAction ? [professionAction] : [],
        {
          id: route ? `request_taxi:${route.code}` : "request_taxi",
          label: route ? `Request ${label(route.displayName || route.code, "Ride")}` : "Request Ride",
          message: {
            type: "rp.taxi.request",
            routeCode: (route == null ? void 0 : route.code) || "",
            pickupNote: "Requested from the in-game taxi marker.",
            destinationNote: (route == null ? void 0 : route.destinationLabel) ? `Destination: ${route.destinationLabel}` : ""
          },
          enabled: canAct && Boolean(route == null ? void 0 : route.code)
        },
        {
          id: openContract ? `claim_taxi:${openContract.id}` : "claim_taxi",
          label: openContract ? `Claim ${label(openContract.routeName || openContract.routeCode, "Fare")}` : "Claim Fare",
          message: { type: "rp.taxi.claim", contractId: (openContract == null ? void 0 : openContract.id) || "" },
          enabled: driverGate.enabled && Boolean(openContract == null ? void 0 : openContract.id) && !ownPassengerContract
        },
        {
          id: claimedContract ? `complete_taxi:${claimedContract.id}` : "complete_taxi",
          label: claimedContract ? `Complete ${label(claimedContract.routeName || claimedContract.routeCode, "Fare")}` : "Complete Fare",
          message: { type: "rp.taxi.complete", contractId: (claimedContract == null ? void 0 : claimedContract.id) || "" },
          enabled: canAct && Boolean(claimedContract == null ? void 0 : claimedContract.id)
        }
      ]
    };
  }
  function businessOrders(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.businessOrders),
      ...optionalArray4(owner == null ? void 0 : owner.businessOrders),
      ...optionalArray4(state.businessOrders)
    ]);
  }
  function openBusinessOrders(owner, state = {}) {
    return businessOrders(owner, state).filter((order) => {
      const status = label(order == null ? void 0 : order.status, "active").toLowerCase();
      return status === "active" || status === "open";
    });
  }
  function businessListings(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.businessListings),
      ...optionalArray4(owner == null ? void 0 : owner.businessListings),
      ...optionalArray4(state.businessListings)
    ]);
  }
  function activeBusinessListings(owner, state = {}) {
    return businessListings(owner, state).filter((listing) => {
      const status = label(listing == null ? void 0 : listing.status, "active").toLowerCase();
      return status === "active" || status === "open";
    });
  }
  function businessOrderDetail(order) {
    var _a;
    if (!order) {
      return "";
    }
    const remaining = Number((_a = order.quantityRemaining) != null ? _a : Math.max(0, Number(order.quantityRequested || 0) - Number(order.quantityFulfilled || 0)));
    const price = Number(order.unitPrice || 0);
    return [
      label(order.businessName, "Business"),
      `${remaining} ${label(order.displayName || order.itemCode, "item")}`,
      price > 0 ? `${price} gold each` : ""
    ].filter(Boolean).join(" - ");
  }
  function businessListingDetail(listing) {
    if (!listing) {
      return "";
    }
    const stock = Number(listing.stockAvailable || 0);
    const price = Number(listing.unitPrice || 0);
    return [
      label(listing.businessName, "Business"),
      `${stock} ${label(listing.displayName || listing.itemCode, "item")}`,
      price > 0 ? `${price} gold each` : ""
    ].filter(Boolean).join(" - ");
  }
  function commerceLabelForAnchor(anchorCode) {
    switch (label(anchorCode, "")) {
      case "riverwood_market_stall_01":
        return "Riverwood Market Stall";
      case "riverwood_trader_shop":
        return "Riverwood Trader";
      case "riverwood_alvor_smithy":
        return "Alvor's Smithy";
      case "riverwood_lumber_yard":
        return "Riverwood Lumber Yard";
      case "riverwood_sleeping_giant_inn":
        return "Sleeping Giant Inn";
      default:
        return "Commerce Board";
    }
  }
  function businessOrderOwnedQuantity(owner, order) {
    const itemCode = label(order == null ? void 0 : order.itemCode, "");
    return itemCode ? inventoryQuantity(owner, itemCode) : 0;
  }
  function businessOrderProfessionReady(owner, order) {
    const profession = businessOrderProfessionCode(order);
    return !profession || activeProfessionCodes(owner).has(profession);
  }
  function bestBusinessOrderForContext(orders, owner) {
    return optionalArray4(orders).find((order) => {
      const owned = businessOrderOwnedQuantity(owner, order);
      return (owned === null || owned > 0) && businessOrderProfessionReady(owner, order);
    }) || optionalArray4(orders).find((order) => {
      const owned = businessOrderOwnedQuantity(owner, order);
      return owned === null || owned > 0;
    }) || optionalArray4(orders)[0] || null;
  }
  function createCommerceContextPayload({ owner, state, canAct, anchorCode = "" }) {
    const cleanAnchor = label(anchorCode, "");
    const orders = openBusinessOrders(owner, state);
    const listings = activeBusinessListings(owner, state);
    const order = bestBusinessOrderForContext(orders, owner);
    const listing = listings[0] || null;
    const ownedOrderQuantity = businessOrderOwnedQuantity(owner, order);
    const orderProfession = businessOrderProfessionCode(order);
    const orderProfessionReady = businessOrderProfessionReady(owner, order);
    const orderRemaining = Math.max(1, Number((order == null ? void 0 : order.quantityRemaining) || 1));
    const fulfillQuantity = ownedOrderQuantity === null ? 1 : Math.max(1, Math.min(orderRemaining, ownedOrderQuantity));
    const listingStock = Number((listing == null ? void 0 : listing.stockAvailable) || 0);
    const listingPrice = Number((listing == null ? void 0 : listing.unitPrice) || 0);
    const wallet = currentWallet(owner, state.character);
    const canFulfillOrder = canAct && Boolean(order == null ? void 0 : order.id) && orderProfessionReady && (ownedOrderQuantity === null || ownedOrderQuantity > 0);
    const canBuyListing = canAct && Boolean(listing == null ? void 0 : listing.id) && listingStock > 0 && (listingPrice <= 0 || wallet >= listingPrice);
    const professionAction = order && !orderProfessionReady ? openProfessionContextAction(owner, orderProfession, "commerce_gate", canAct) : null;
    if (!cleanAnchor && orders.length === 0 && listings.length === 0) {
      return { target: null, actions: [] };
    }
    return {
      target: {
        type: "commerce",
        id: cleanAnchor || "commerce",
        label: commerceLabelForAnchor(cleanAnchor),
        details: [
          `${orders.length} open order${orders.length === 1 ? "" : "s"}`,
          `${listings.length} shop listing${listings.length === 1 ? "" : "s"}`,
          order ? businessOrderDetail(order) : "",
          order && ownedOrderQuantity !== null ? `Inventory: ${ownedOrderQuantity} ${label(order.displayName || order.itemCode, "item")}` : "",
          order && !orderProfessionReady ? `Profession: choose ${humanizedCode(orderProfession, "Profession")} in K` : "",
          listing ? businessListingDetail(listing) : "",
          `Wallet: ${wallet} gold`
        ].filter(Boolean)
      },
      actions: [
        {
          id: "refresh_business_orders",
          label: "Refresh Orders",
          message: { type: "rp.business.orders.refresh", status: "active" },
          enabled: canAct
        },
        ...professionAction ? [professionAction] : [],
        {
          id: order ? `fulfill_business_order:${order.id}` : "fulfill_business_order",
          label: order ? `Fulfill ${label(order.displayName || order.itemCode, "Order")}` : "Fulfill Order",
          message: {
            type: "rp.business.order.fulfill",
            orderId: (order == null ? void 0 : order.id) || "",
            quantity: fulfillQuantity
          },
          enabled: canFulfillOrder
        },
        {
          id: "refresh_business_listings",
          label: "Refresh Shop",
          message: { type: "rp.business.listings.refresh", status: "active" },
          enabled: canAct
        },
        {
          id: listing ? `buy_business_listing:${listing.id}` : "buy_business_listing",
          label: listing ? `Buy ${label(listing.displayName || listing.itemCode, "Item")}` : "Buy Item",
          message: {
            type: "rp.business.listing.buy",
            listingId: (listing == null ? void 0 : listing.id) || "",
            quantity: 1
          },
          enabled: canBuyListing
        }
      ]
    };
  }
  function knownRecipes(owner, state = {}) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.recipes),
      ...optionalArray4(owner == null ? void 0 : owner.recipes),
      ...optionalArray4(state.recipes)
    ]);
  }
  function knownSpellCodes(owner) {
    return new Set(optionalArray4(owner == null ? void 0 : owner.spells).map((spell) => label((spell == null ? void 0 : spell.spellCode) || (spell == null ? void 0 : spell.code), "").toLowerCase()).filter(Boolean));
  }
  function spellCatalog(owner) {
    const available = (owner == null ? void 0 : owner.available) || {};
    return uniqueRecords([
      ...optionalArray4(available.spells),
      ...optionalArray4(owner == null ? void 0 : owner.availableSpells)
    ]);
  }
  function inventoryItemForCode(owner, itemCode) {
    const code = label(itemCode, "").toLowerCase();
    if (!code || !inventoryKnown(owner)) {
      return null;
    }
    return inventoryLists(owner).find((item) => label((item == null ? void 0 : item.itemCode) || (item == null ? void 0 : item.code), "").toLowerCase() === code && Number((item == null ? void 0 : item.quantity) || 0) > 0) || null;
  }
  function firstLearnableSpellTome(owner) {
    const known = knownSpellCodes(owner);
    for (const spell of spellCatalog(owner)) {
      const spellCode = label((spell == null ? void 0 : spell.code) || (spell == null ? void 0 : spell.spellCode), "").toLowerCase();
      const itemCode = label((spell == null ? void 0 : spell.spellTomeItemCode) || (spell == null ? void 0 : spell.tomeItemCode), "").toLowerCase();
      if (!spellCode || !itemCode || known.has(spellCode)) {
        continue;
      }
      const item = inventoryItemForCode(owner, itemCode);
      if (!item) {
        continue;
      }
      return {
        spell,
        item,
        itemCode,
        itemDisplayName: label(item.displayName || item.itemDisplayName || spell.spellTomeDisplayName, "Spell Tome"),
        spellDisplayName: label(spell.displayName || spell.name || spellCode, "Spell")
      };
    }
    return null;
  }
  function recipeCode(recipe) {
    return label((recipe == null ? void 0 : recipe.recipeCode) || (recipe == null ? void 0 : recipe.code), "");
  }
  function craftingCategoryForAnchor(anchorCode) {
    switch (label(anchorCode, "")) {
      case "riverwood_cooking_station":
      case "riverwood_cooking_pot":
        return "cooking";
      case "riverwood_forge":
      case "riverwood_smithing_station":
        return "smithing";
      case "riverwood_tanning_rack":
      case "riverwood_tailoring_station":
        return "tailoring";
      case "riverwood_fletcher_station":
        return "fletcher";
      case "riverwood_alchemy_station":
        return "alchemy";
      case "riverwood_scribe_desk":
        return "scribe";
      case "riverwood_enchanter_table":
      case "riverwood_arcane_enchanter":
        return "enchanter";
      default:
        return "";
    }
  }
  function craftingLabelForAnchor(anchorCode) {
    switch (label(anchorCode, "")) {
      case "riverwood_cooking_station":
      case "riverwood_cooking_pot":
        return "Cooking Station";
      case "riverwood_forge":
      case "riverwood_smithing_station":
        return "Smithing Station";
      case "riverwood_tanning_rack":
        return "Tanning Rack";
      case "riverwood_tailoring_station":
        return "Tailoring Station";
      case "riverwood_fletcher_station":
        return "Fletcher Station";
      case "riverwood_alchemy_station":
        return "Alchemy Station";
      case "riverwood_scribe_desk":
        return "Scribe Desk";
      case "riverwood_enchanter_table":
      case "riverwood_arcane_enchanter":
        return "Enchanter Table";
      default:
        return "Crafting Station";
    }
  }
  function recipeProfessionLabel(recipe) {
    return humanizedCode(recipe == null ? void 0 : recipe.category, "Profession");
  }
  function recipeRequiredProfessionLevel(recipe) {
    return Math.max(1, Number((recipe == null ? void 0 : recipe.requiredProfessionLevel) || (recipe == null ? void 0 : recipe.requiredLevel) || 1));
  }
  function professionLevelForCode(owner, professionCodeValue) {
    const code = label(professionCodeValue, "").toLowerCase();
    if (!code) {
      return 0;
    }
    const progress = optionalArray4(owner == null ? void 0 : owner.professions).find((entry) => professionCode(entry) === code);
    if (progress) {
      return Math.max(1, Number(progress.level || 1));
    }
    const membership = professionMemberships(owner).find((entry) => professionCode(entry) === code);
    return membership ? Math.max(1, Number(membership.level || 1)) : 0;
  }
  function recipeIngredientDetails(recipe, owner, quantity = 1) {
    return optionalArray4(recipe == null ? void 0 : recipe.ingredients).map((ingredient) => {
      const itemCode = label(ingredient.itemCode || ingredient.code, "");
      const needed = Math.max(1, Number(ingredient.quantity || 1) * quantity);
      const owned = inventoryQuantity(owner, itemCode);
      const ownedLabel = owned === null ? "" : ` (${owned}/${needed})`;
      return `${needed} ${label(ingredient.displayName || itemCode, "ingredient")}${ownedLabel}`;
    });
  }
  function recipeCraftGate(recipe, owner, canAct, quantity = 1) {
    const reasons = [];
    const category = label(recipe == null ? void 0 : recipe.category, "").toLowerCase();
    if (!canAct) {
      reasons.push("join the server");
    }
    if (!recipeCode(recipe)) {
      reasons.push("recipe unavailable");
    }
    if (category && !activeProfessionCodes(owner).has(category)) {
      reasons.push(`choose ${recipeProfessionLabel(recipe)} in K`);
    } else if (category) {
      const requiredLevel = recipeRequiredProfessionLevel(recipe);
      const currentLevel = professionLevelForCode(owner, category);
      if (currentLevel < requiredLevel) {
        reasons.push(`reach ${recipeProfessionLabel(recipe)} level ${requiredLevel}`);
      }
    }
    for (const ingredient of optionalArray4(recipe == null ? void 0 : recipe.ingredients)) {
      const itemCode = label(ingredient.itemCode || ingredient.code, "");
      const needed = Math.max(1, Number(ingredient.quantity || 1) * quantity);
      const owned = inventoryQuantity(owner, itemCode);
      if (owned !== null && owned < needed) {
        reasons.push(`missing ${label(ingredient.displayName || itemCode, "ingredient")}`);
      }
    }
    return {
      enabled: reasons.length === 0,
      reasons
    };
  }
  function createCraftingContextPayload({ owner, state, canAct, anchorCode = "" }) {
    const cleanAnchor = label(anchorCode, "");
    const stationCategory = craftingCategoryForAnchor(cleanAnchor);
    const allRecipes = knownRecipes(owner, state);
    const recipes = stationCategory ? allRecipes.filter((recipe2) => label(recipe2 == null ? void 0 : recipe2.category, "").toLowerCase() === stationCategory) : allRecipes;
    const recipeEntries = recipes.map((candidate) => ({
      recipe: candidate,
      gate: recipeCraftGate(candidate, owner, canAct)
    }));
    const readyRecipeEntries = recipeEntries.filter((entry) => entry.gate.enabled);
    const previewEntry = readyRecipeEntries[0] || recipeEntries[0] || null;
    const recipe = (previewEntry == null ? void 0 : previewEntry.recipe) || null;
    const gate = (previewEntry == null ? void 0 : previewEntry.gate) || recipeCraftGate(null, owner, canAct);
    const recipeProfession = label(recipe == null ? void 0 : recipe.category, "").toLowerCase();
    const spellTome = !stationCategory || stationCategory === "scribe" ? firstLearnableSpellTome(owner) : null;
    const professionAction = recipeProfession && !activeProfessionCodes(owner).has(recipeProfession) ? openProfessionContextAction(owner, recipeProfession, "crafting_gate", canAct) : null;
    if (!cleanAnchor && recipes.length === 0 && !spellTome) {
      return { target: null, actions: [] };
    }
    return {
      target: {
        type: "crafting",
        id: cleanAnchor || "crafting",
        label: craftingLabelForAnchor(cleanAnchor),
        details: [
          `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`,
          recipes.length > 0 ? `${readyRecipeEntries.length} ready` : "",
          recipe ? `Selected: ${label(recipe.displayName || recipeCode(recipe), "Recipe")}` : "",
          recipe ? `Profession: ${recipeProfessionLabel(recipe)}${activeProfessionCodes(owner).has(label(recipe.category, "").toLowerCase()) ? " (chosen)" : " (choose in K)"}` : "",
          ...recipeIngredientDetails(recipe, owner),
          recipe ? `Produces ${Number(recipe.outputQuantity || 1)} ${label(recipe.outputDisplayName || recipe.outputItemCode, "item")}` : "",
          spellTome ? `Study: ${spellTome.itemDisplayName} teaches ${spellTome.spellDisplayName}` : "",
          recipe ? gate.enabled ? "Ready: crafts item and profession XP" : `Needs: ${gate.reasons.join(", ")}` : "",
          !recipe && spellTome ? "Ready: study tome to learn spell" : ""
        ].filter(Boolean)
      },
      actions: [
        ...spellTome ? [{
          id: `learn_spell_tome:${spellTome.itemCode}`,
          label: `Study ${spellTome.itemDisplayName}`,
          message: {
            type: "rp.spell.tome.learn",
            itemCode: spellTome.itemCode
          },
          enabled: canAct
        }] : [],
        ...professionAction ? [professionAction] : [],
        ...recipeEntries.slice(0, 5).map((entry) => {
          var _a, _b;
          return {
            id: `craft_recipe:${recipeCode(entry.recipe)}`,
            label: entry.gate.enabled ? `Craft ${label(((_a = entry.recipe) == null ? void 0 : _a.displayName) || recipeCode(entry.recipe), "Recipe")}` : `Locked: ${label(((_b = entry.recipe) == null ? void 0 : _b.displayName) || recipeCode(entry.recipe), "Recipe")}`,
            message: {
              type: "rp.craft.recipe",
              recipeCode: recipeCode(entry.recipe),
              quantity: 1
            },
            enabled: entry.gate.enabled
          };
        }),
        {
          id: "refresh_crafting",
          label: "Refresh",
          message: { type: "rp.overview.refresh" },
          enabled: canAct
        }
      ]
    };
  }
  function firstStoredItem(property) {
    return optionalArray4(property == null ? void 0 : property.storage).find((item) => label((item == null ? void 0 : item.itemCode) || (item == null ? void 0 : item.code), "") && Number((item == null ? void 0 : item.quantity) || 0) > 0) || null;
  }
  function propertyStorageDetail(property) {
    const storage2 = optionalArray4(property == null ? void 0 : property.storage);
    const total = storage2.reduce((sum, item) => sum + Math.max(0, Number((item == null ? void 0 : item.quantity) || 0)), 0);
    return total > 0 ? `Storage: ${total} item${total === 1 ? "" : "s"}` : "Storage empty";
  }
  function propertyOwnerDetail(property) {
    if (!property) {
      return "Owner: unknown";
    }
    const ownerName = label(
      property.ownerCharacterName || property.ownerName || property.ownerDisplayName || property.ownerCharacterId,
      ""
    );
    const tenantName = label(property.tenantCharacterName || property.tenantName || property.tenantCharacterId, "");
    if (ownerName) {
      return `Owner: ${ownerName}`;
    }
    if (tenantName) {
      return `Tenant: ${tenantName}`;
    }
    const status = label(property.status, "").toLowerCase();
    return status === "available" || status === "unowned" ? "Owner: unowned" : "Owner: unknown";
  }
  function propertyTenantDetail(property) {
    if (!property) {
      return "";
    }
    const tenantName = label(property.tenantCharacterName || property.tenantName || property.tenantCharacterId, "");
    return tenantName ? `Tenant: ${tenantName}` : "Tenant: none";
  }
  function propertyStatusDetail(property) {
    const status = humanizedCode(property == null ? void 0 : property.status, "");
    const type = humanizedCode(property == null ? void 0 : property.propertyType, "");
    return [status ? `Status: ${status}` : "", type ? `Type: ${type}` : ""].filter(Boolean).join(" - ");
  }
  function propertyLockForTarget(property, targetCode = "") {
    const cleanTarget = label(targetCode, "");
    const locks = optionalArray4(property == null ? void 0 : property.locks);
    return cleanTarget ? locks.find((entry) => label(entry == null ? void 0 : entry.targetCode, "") === cleanTarget) : firstPropertyLock(property);
  }
  function propertyLockStateForTarget(property, targetCode = "") {
    const cleanTarget = label(targetCode, "");
    const states = optionalArray4(property == null ? void 0 : property.lockStates);
    return cleanTarget ? states.find((entry) => label(entry == null ? void 0 : entry.targetCode, "") === cleanTarget) : states[0] || null;
  }
  function activePropertyKeys(property, { targetCode = "", characterId = "" } = {}) {
    const cleanTarget = label(targetCode, "");
    const cleanCharacterId = label(characterId, "");
    return optionalArray4(property == null ? void 0 : property.keys).filter((key) => (key == null ? void 0 : key.active) !== false && !(key == null ? void 0 : key.revokedAt)).filter((key) => !cleanTarget || label(key == null ? void 0 : key.targetCode, "") === cleanTarget).filter((key) => !cleanCharacterId || label(key == null ? void 0 : key.characterId, "") === cleanCharacterId);
  }
  function firstActivePropertyKey(property, filters = {}) {
    return activePropertyKeys(property, filters)[0] || null;
  }
  function propertyKeySummaryDetail(property, targetCode = "") {
    const lockState = propertyLockStateForTarget(property, targetCode);
    if (lockState && Number.isFinite(Number(lockState.activeKeyCount))) {
      return `Active keys: ${Number(lockState.activeKeyCount)}`;
    }
    if (!Array.isArray(property == null ? void 0 : property.keys)) {
      return "";
    }
    const keys = activePropertyKeys(property, { targetCode });
    if (keys.length === 0) {
      return "";
    }
    return `Active keys: ${keys.length}`;
  }
  function propertyLockDetail(property, targetCode = "") {
    const lock = propertyLockForTarget(property, targetCode);
    const lockState = propertyLockStateForTarget(property, targetCode);
    if (!lock) {
      return property ? "Lock: not configured" : "Lock: unknown";
    }
    const state = label((lockState == null ? void 0 : lockState.lockState) || lock.state || lock.lockState || (lock.locked === false ? "unlocked" : "locked"), "locked");
    const displayName = label(lock.displayName || lock.targetCode, "Door");
    return `Lock: ${displayName} ${state}`;
  }
  function propertyLockDetails(property, targetCode = "", propertyInteraction = null) {
    const lock = propertyLockForTarget(property, targetCode);
    const lockState = propertyLockStateForTarget(property, targetCode);
    if (!lock) {
      return [propertyLockDetail(property, targetCode)];
    }
    const openState = label(
      (lockState == null ? void 0 : lockState.doorState) === "unknown" ? "" : (lockState == null ? void 0 : lockState.doorState) || lock.openState || lock.doorState || (typeof lock.open === "boolean" ? lock.open ? "open" : "closed" : ""),
      ""
    );
    const requiredRoles = optionalArray4(lock.requiredRoles).length > 0 ? optionalArray4(lock.requiredRoles) : optionalArray4(propertyInteraction == null ? void 0 : propertyInteraction.requiredRoles);
    const allowed = typeof (lockState == null ? void 0 : lockState.allowed) === "boolean" ? `Access: ${lockState.allowed ? `allowed via ${label(lockState.reason, "permission")}` : "denied"}` : "";
    const authority = (lockState == null ? void 0 : lockState.canIssueKey) || (lockState == null ? void 0 : lockState.canRevokeKey) || (lockState == null ? void 0 : lockState.canChangeLock) ? `Authority: ${[
      lockState.canIssueKey ? "issue keys" : "",
      lockState.canRevokeKey ? "revoke keys" : "",
      lockState.canChangeLock ? "change lock" : ""
    ].filter(Boolean).join(", ")}` : "";
    return [
      propertyLockDetail(property, targetCode),
      openState ? `Door: ${openState}` : "",
      Number.isFinite(Number(lock.lockLevel)) ? `Lock level: ${Number(lock.lockLevel)}` : "",
      propertyKeySummaryDetail(property, targetCode),
      allowed,
      authority,
      requiredRoles.length > 0 ? `Required: ${requiredRoles.join(", ")}` : ""
    ].filter(Boolean);
  }
  function propertyAccessDetail(property, owner, propertyInteraction = null) {
    var _a;
    if (!property) {
      return "Your access: unknown";
    }
    const characterId = label((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id, "");
    const role = label(property.role, "").toLowerCase();
    if (role) {
      return `Your access: ${role}`;
    }
    if (characterId && property.ownerCharacterId === characterId) {
      return "Your access: owner";
    }
    if (characterId && property.tenantCharacterId === characterId) {
      return "Your access: tenant";
    }
    const guildControl = firstGuildPropertyControl(owner, property);
    if (guildControl) {
      const title = label(guildControl.title, humanizedCode(guildControl.rankCode, "Guild controller"));
      return `Your access: ${title} of ${label(guildControl.guildName || guildControl.guildCode, "guild")}`;
    }
    const requiredRoles = optionalArray4(propertyInteraction == null ? void 0 : propertyInteraction.requiredRoles);
    return requiredRoles.length > 0 ? `Your access: needs ${requiredRoles.join(", ")} or key` : "Your access: key or permission required";
  }
  function propertyIdValue(property) {
    return label((property == null ? void 0 : property.id) || (property == null ? void 0 : property.propertyId), "");
  }
  function propertyLineageIdSet(property) {
    var _a;
    return new Set([
      propertyIdValue(property),
      label(property == null ? void 0 : property.parentPropertyId, ""),
      label(property == null ? void 0 : property.rootPropertyId, ""),
      label((_a = property == null ? void 0 : property.config) == null ? void 0 : _a.rootPropertyId, "")
    ].filter(Boolean));
  }
  function activeGuildMemberships(owner) {
    return optionalArray4(owner == null ? void 0 : owner.guildMemberships).filter((membership) => (membership == null ? void 0 : membership.status) === void 0 || membership.status === "active");
  }
  function firstGuildMemberManager(owner) {
    return activeGuildMemberships(owner).find((membership) => {
      var _a;
      return ((_a = membership == null ? void 0 : membership.permissions) == null ? void 0 : _a.manageMembers) === true;
    }) || null;
  }
  function guildIdentifier(membership) {
    return label((membership == null ? void 0 : membership.guildId) || (membership == null ? void 0 : membership.guildCode), "");
  }
  function guildRosterForMembership(owner, membership) {
    var _a;
    const membershipGuildId = guildIdentifier(membership);
    const membershipGuildCode = label(membership == null ? void 0 : membership.guildCode, "");
    return optionalArray4((_a = owner == null ? void 0 : owner.available) == null ? void 0 : _a.guildRosters).find((roster) => membershipGuildId && label((roster == null ? void 0 : roster.guildId) || (roster == null ? void 0 : roster.guildCode), "") === membershipGuildId || membershipGuildCode && label(roster == null ? void 0 : roster.guildCode, "") === membershipGuildCode) || null;
  }
  function guildRosterMemberForCharacter(owner, membership, characterId) {
    const cleanCharacterId = label(characterId, "");
    if (!cleanCharacterId) {
      return null;
    }
    const roster = guildRosterForMembership(owner, membership);
    return optionalArray4(roster == null ? void 0 : roster.members).find((member) => label(member == null ? void 0 : member.characterId, "") === cleanCharacterId && (!member.status || member.status === "active")) || null;
  }
  function guildMembershipsForProperty(owner, property) {
    const propertyIds = propertyLineageIdSet(property);
    if (propertyIds.size === 0) {
      return [];
    }
    return activeGuildMemberships(owner).filter((membership) => propertyIds.has(label(membership.headquartersPropertyId, "")));
  }
  function membershipHasAnyPermission(membership, permissions) {
    return permissions.some((permission) => {
      var _a;
      return ((_a = membership == null ? void 0 : membership.permissions) == null ? void 0 : _a[permission]) === true;
    });
  }
  function firstGuildPropertyControl(owner, property, permissions = ["manageProperty", "manageKeys", "revokeKeys", "assignRooms"]) {
    return guildMembershipsForProperty(owner, property).find((membership) => membershipHasAnyPermission(membership, permissions)) || null;
  }
  function guildPropertyControlDetail(property, owner) {
    const guildControl = firstGuildPropertyControl(owner, property);
    if (!guildControl) {
      return "";
    }
    const title = label(guildControl.title, humanizedCode(guildControl.rankCode, "Controller"));
    return `Guild control: ${label(guildControl.guildName || guildControl.guildCode, "Guild")} - ${title}`;
  }
  function canUsePropertyStorage(property, characterId = "") {
    const role = label(property == null ? void 0 : property.role, "").toLowerCase();
    return ["owner", "tenant", "steward", "storage"].includes(role) || characterId && ((property == null ? void 0 : property.ownerCharacterId) === characterId || (property == null ? void 0 : property.tenantCharacterId) === characterId);
  }
  function hasDirectPropertyManagement(property, characterId = "") {
    const role = label(property == null ? void 0 : property.role, "").toLowerCase();
    return ["owner", "steward"].includes(role) || characterId && (property == null ? void 0 : property.ownerCharacterId) === characterId;
  }
  function canListPropertyDeed(property, characterId = "") {
    const role = label(property == null ? void 0 : property.role, "").toLowerCase();
    return role === "owner" || characterId && (property == null ? void 0 : property.ownerCharacterId) === characterId;
  }
  function activePropertySaleListingCount(property) {
    return optionalArray4((property == null ? void 0 : property.saleListings) || (property == null ? void 0 : property.propertySaleListings)).filter((listing) => !(listing == null ? void 0 : listing.status) || listing.status === "active").length;
  }
  function canManageProperty(property, characterId = "", owner = null) {
    return hasDirectPropertyManagement(property, characterId) || Boolean(firstGuildPropertyControl(owner, property));
  }
  function canIssuePropertyKey(property, characterId = "", owner = null) {
    return hasDirectPropertyManagement(property, characterId) || Boolean(firstGuildPropertyControl(owner, property, ["manageKeys", "revokeKeys", "assignRooms", "manageProperty"]));
  }
  function propertyManagementCandidates(owner) {
    var _a;
    const records = [
      ...optionalArray4(owner == null ? void 0 : owner.properties),
      ...optionalArray4((_a = owner == null ? void 0 : owner.available) == null ? void 0 : _a.propertyInteractions)
    ];
    const seen = /* @__PURE__ */ new Set();
    return records.filter((property) => {
      const propertyId = propertyIdValue(property);
      if (!propertyId || seen.has(propertyId)) {
        return false;
      }
      seen.add(propertyId);
      return true;
    });
  }
  function firstManageablePropertyWithLock(owner) {
    var _a;
    const characterId = label((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id, "");
    return propertyManagementCandidates(owner).find((property) => canIssuePropertyKey(property, characterId, owner) && firstPropertyLock(property)) || null;
  }
  function firstDirectManageableProperty(owner) {
    var _a;
    const characterId = label((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id, "");
    return optionalArray4(owner == null ? void 0 : owner.properties).find((property) => hasDirectPropertyManagement(property, characterId)) || null;
  }
  var propertyAnchorCatalog = {
    riverwood_property_room_door: {
      label: "Riverwood Room Door",
      propertyId: "riverwood_sleeping_giant_room_01",
      target: "room_01_door",
      interaction: "door_access",
      requiredRoles: ["owner", "tenant", "steward"],
      actionLabel: "Checking room door access",
      success: "Room door access check sent."
    },
    riverwood_room_storage_chest_01: {
      label: "Riverwood Room Storage Chest",
      propertyId: "riverwood_sleeping_giant_room_01_chest",
      target: "room_01_chest",
      interaction: "storage_open",
      requiredRoles: ["owner", "tenant", "storage", "steward"],
      actionLabel: "Opening room storage",
      success: "Room storage access check sent."
    }
  };
  function propertyInteractionForAnchor(anchorCode) {
    const entry = propertyAnchorCatalog[label(anchorCode, "").toLowerCase()];
    if (!entry) {
      return null;
    }
    return __spreadProps(__spreadValues({}, entry), {
      message: {
        propertyId: entry.propertyId,
        interaction: entry.interaction,
        target: entry.target,
        requiredRoles: [...entry.requiredRoles]
      }
    });
  }
  function propertyRecordForInteraction(owner, propertyInteraction) {
    const propertyId = label(propertyInteraction == null ? void 0 : propertyInteraction.propertyId, "");
    if (!propertyId) {
      return null;
    }
    const available = (owner == null ? void 0 : owner.available) || {};
    const records = [
      ...optionalArray4(owner == null ? void 0 : owner.properties),
      ...optionalArray4(available.propertyInteractions),
      ...optionalArray4(available.purchasableProperties),
      ...optionalArray4(available.rentableProperties)
    ];
    return records.find((property) => label(property == null ? void 0 : property.id, "") === propertyId) || null;
  }
  function createDungeonContextPayload({ encounter, canAct }) {
    if (!encounter) {
      return { target: null, actions: [] };
    }
    const gate = dungeonEncounterGate(encounter, canAct);
    const code = dungeonEncounterCode(encounter);
    return {
      target: {
        type: "dungeon",
        id: code,
        label: label(encounter.displayName || encounter.worldReferenceDisplayName || code, "Dungeon Encounter"),
        details: dungeonEncounterDetail(encounter, gate)
      },
      actions: [
        {
          id: `start_dungeon:${code}`,
          label: gate.enabled ? "Start Encounter" : "Encounter Locked",
          message: { type: "rp.dungeon.start", encounterCode: code },
          enabled: gate.enabled && Boolean(code)
        },
        {
          id: "refresh_dungeons",
          label: "Refresh",
          message: { type: "rp.overview.refresh" },
          enabled: canAct
        }
      ]
    };
  }
  function createResourceAnchorContextPayload(resource, owner, canAct) {
    if (!resource) {
      return { target: null, actions: [] };
    }
    const gate = resourceGatherGate(resource, owner, canAct);
    const profession = resourceProfessionCode(resource);
    const needsProfession = Boolean(profession && !activeProfessionCodes(owner).has(profession));
    const canOpenProfessionChoice2 = needsProfession && (!primaryProfession(owner) || activeProfessionInvitationCodes(owner).has(profession));
    return {
      target: {
        type: "resource_node",
        id: resource.code,
        label: label(resource.displayName || resource.code, "Resource Node"),
        details: resourceContextDetails(resource, owner, gate)
      },
      actions: [
        {
          id: "gather_resource",
          label: gate.enabled ? "Gather" : "Gather Locked",
          message: { type: "rp.resource.gather", nodeCode: resource.code },
          enabled: gate.enabled
        },
        ...canOpenProfessionChoice2 ? [{
          id: "open_professions",
          label: "Open Professions",
          message: { type: "rp.professions.open", source: "resource_gate", professionCode: profession },
          enabled: canAct
        }] : [],
        {
          id: "refresh_resources",
          label: "Refresh",
          message: { type: "rp.resources.refresh" },
          enabled: canAct
        }
      ]
    };
  }
  function createPropertyAnchorContextPayload({ propertyInteraction, owner, canAct }) {
    var _a;
    if (!propertyInteraction) {
      return { target: null, actions: [] };
    }
    const property = propertyRecordForInteraction(owner, propertyInteraction);
    const characterId = label((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id, "");
    const lock = propertyLockForTarget(property, propertyInteraction.target);
    const canManageTargetLock = canManageProperty(property, characterId, owner);
    const canManageTargetKeys = canIssuePropertyKey(property, characterId, owner);
    const canListDeed = canListPropertyDeed(property, characterId);
    const activeSaleListings = activePropertySaleListingCount(property);
    const activeKeyForTarget = firstActivePropertyKey(property, { targetCode: propertyInteraction.target });
    const holdingsAction = openHoldingsContextAction(owner, "property_gate", canAct);
    return {
      target: {
        type: "property",
        id: propertyInteraction.propertyId,
        label: label((property == null ? void 0 : property.name) || (property == null ? void 0 : property.displayName) || propertyInteraction.label, "Property Object"),
        details: [
          propertyOwnerDetail(property),
          propertyTenantDetail(property),
          propertyStatusDetail(property),
          ...propertyLockDetails(property, propertyInteraction.target, propertyInteraction),
          propertyAccessDetail(property, owner, propertyInteraction),
          guildPropertyControlDetail(property, owner),
          activeSaleListings > 0 ? `Sale listings: ${activeSaleListings} active` : "",
          propertyInteraction.interaction ? `Action: ${propertyInteraction.interaction}` : "",
          propertyInteraction.target ? `Target: ${propertyInteraction.target}` : ""
        ].filter(Boolean)
      },
      actions: [
        {
          id: "property_interact",
          label: propertyInteraction.interaction === "storage_open" ? "Open Storage" : "Check Access",
          message: __spreadValues({
            type: "rp.property.interact"
          }, propertyInteraction.message),
          enabled: canAct
        },
        {
          id: "refresh_properties",
          label: "Refresh",
          message: { type: "rp.properties.refresh" },
          enabled: canAct
        },
        ...holdingsAction ? [holdingsAction] : [],
        ...canListDeed ? [{
          id: "create_property_sale_listing",
          label: "List Deed",
          message: {
            type: "rp.property.saleListing.create",
            propertyId: propertyInteraction.propertyId
          },
          requiresText: true,
          textPrompt: "Sale price in gold",
          enabled: canAct && Boolean(propertyInteraction.propertyId)
        }] : [],
        ...canManageTargetLock && lock ? [{
          id: "change_property_lock",
          label: "Change Lock",
          message: {
            type: "rp.property.lock.change",
            propertyId: propertyInteraction.propertyId,
            targetCode: propertyInteraction.target,
            reason: "Changed lock from in-game property context"
          },
          enabled: canAct && canManageTargetLock && Boolean(propertyInteraction.propertyId && (lock == null ? void 0 : lock.targetCode))
        }] : [],
        ...canManageTargetKeys && activeKeyForTarget ? [{
          id: "revoke_property_key",
          label: `Revoke ${label(activeKeyForTarget.characterName || activeKeyForTarget.label, "Key")}`,
          message: {
            type: "rp.property.key.revoke",
            propertyId: propertyInteraction.propertyId,
            keyId: activeKeyForTarget.id
          },
          enabled: canAct && Boolean(activeKeyForTarget.id)
        }] : []
      ]
    };
  }
  var onboardingDestinationsByPortal = Object.freeze({
    onboarding_portal_riverwood: Object.freeze({
      code: "riverwood",
      portalDisplayName: "Riverwood Portal",
      displayName: "Riverwood",
      description: "Small starter town with gathering, crafting, inn work, hunting, and the first dungeon route.",
      preview: Object.freeze({
        summary: "Best first stop for woodcutting, mining, fishing, farming, hunting, starter crafting, and wolf-den practice.",
        startsNear: "Sleeping Giant Inn and the Riverwood work board",
        recommendedFor: Object.freeze(["first profession", "resource gathering", "starter dungeon"]),
        starterKit: Object.freeze(["Wood Axe", "Pickaxe", "Fishing Rod"])
      })
    }),
    onboarding_portal_whiterun: Object.freeze({
      code: "whiterun",
      portalDisplayName: "Whiterun Portal",
      displayName: "Whiterun Gate",
      description: "Second starter route for courier work, guard contracts, city trade, and midgame bandit encounters.",
      preview: Object.freeze({
        summary: "Best first stop for courier loops, guard board work, market trade, taxis, and the Halted Stream bandit camp path.",
        startsNear: "Whiterun exterior notice board",
        recommendedFor: Object.freeze(["courier route", "guard work", "city market"]),
        starterKit: Object.freeze(["Wood Axe", "Pickaxe", "Fishing Rod"])
      })
    })
  });
  function onboardingDestinationForCode(destinationCode) {
    const cleanCode = label(destinationCode, "");
    return Object.values(onboardingDestinationsByPortal).find((destination) => destination.code === cleanCode) || null;
  }
  var onboardingTipsByAnchor = Object.freeze({
    onboarding_tip_appearance: Object.freeze({
      code: "appearance",
      label: "Create Your Look",
      phase: "appearance_required",
      controls: Object.freeze(["RaceMenu"]),
      text: "Create your appearance first. Portals stay locked until the server saves RaceMenu completion for this character."
    }),
    onboarding_tip_portals: Object.freeze({
      code: "starter_portals",
      label: "Choose A Starter Town",
      phase: "portal_ready",
      controls: Object.freeze(["Walk"]),
      text: "Look at a portal preview, then walk through the destination you want. That destination becomes your saved start position."
    }),
    onboarding_tip_professions: Object.freeze({
      code: "professions",
      label: "Professions",
      phase: "portal_ready",
      controls: Object.freeze(["K"]),
      text: "Use K to pick a profession path. Gathering, refining, crafting, and job work award profession XP."
    }),
    onboarding_tip_gathering: Object.freeze({
      code: "gathering",
      label: "Gathering",
      phase: "portal_ready",
      controls: Object.freeze(["E", "X"]),
      text: "Gather from marked resource nodes with the right tool, then use nearby stations to refine materials."
    }),
    onboarding_tip_crafting: Object.freeze({
      code: "crafting",
      label: "Crafting",
      phase: "portal_ready",
      controls: Object.freeze(["E", "X"]),
      text: "Crafting recipes consume server inventory and award XP. Higher profession levels unlock better recipes."
    }),
    onboarding_tip_communication: Object.freeze({
      code: "communication",
      label: "Communication",
      phase: "portal_ready",
      controls: Object.freeze(["Enter", "V", "H", "G"]),
      text: "Use chat and voice to coordinate. Holdings, guilds, boards, and public roles give longer-term RP goals."
    }),
    onboarding_tip_save_state: Object.freeze({
      code: "character_save",
      label: "Character Save",
      phase: "portal_ready",
      controls: Object.freeze(["Reconnect"]),
      text: "Gold, inventory, equipment, profession XP, ownership, spells, actor form, and position are loaded from your character save."
    })
  });
  function createOnboardingAnchorContextPayload({ anchorCode, canAct }) {
    const cleanAnchor = label(anchorCode, "");
    const destination = onboardingDestinationsByPortal[cleanAnchor];
    if (destination) {
      return {
        target: {
          type: "onboarding_portal",
          id: destination.code,
          label: destination.portalDisplayName,
          details: [
            destination.description,
            destination.preview.summary,
            `Starts near: ${destination.preview.startsNear}`,
            `Good for: ${destination.preview.recommendedFor.join(", ")}`,
            `Starter kit: ${destination.preview.starterKit.join(", ")}`
          ]
        },
        actions: [
          {
            id: `approve_onboarding_portal:${destination.code}`,
            label: `Start in ${destination.displayName}`,
            message: {
              type: "rp.onboarding.portal.approve",
              destinationCode: destination.code
            },
            enabled: canAct
          }
        ]
      };
    }
    const tip = onboardingTipsByAnchor[cleanAnchor];
    if (!tip) {
      return { target: null, actions: [] };
    }
    const actions = [];
    if (tip.code === "professions") {
      actions.push({
        id: "open_professions",
        label: "Open Professions",
        message: { type: "rp.professions.open" },
        enabled: canAct
      });
    }
    if (tip.code === "communication") {
      actions.push({
        id: "open_comms",
        label: "Open Comms",
        message: { type: "rp.comms.open" },
        enabled: canAct
      });
      actions.push({
        id: "open_holdings",
        label: "Open Holdings",
        message: { type: "rp.organizations.open", mode: "holdings" },
        enabled: canAct
      });
    }
    if (tip.code === "character_save") {
      actions.push({
        id: "refresh_character_save",
        label: "Refresh Save",
        message: { type: "rp.overview.refresh" },
        enabled: canAct
      });
    }
    return {
      target: {
        type: "onboarding_tip",
        id: tip.code,
        label: tip.label,
        details: [
          tip.text,
          `Controls: ${tip.controls.join(", ")}`,
          `Phase: ${tip.phase}`
        ]
      },
      actions
    };
  }
  function createActivatedAnchorContextPayload({ owner, state, canAct, anchorCode }) {
    const onboardingContext = createOnboardingAnchorContextPayload({ anchorCode, canAct });
    if (onboardingContext.target) {
      return onboardingContext;
    }
    const boardContext = createWorldAnchorContextPayload({ owner, state, canAct, anchorCode });
    if (boardContext.target) {
      return boardContext;
    }
    const dungeon = dungeonEncounterForAnchor(owner, state, anchorCode);
    if (dungeon) {
      return createDungeonContextPayload({ encounter: dungeon, canAct });
    }
    const resource = firstResourceForAnchor(owner, state, anchorCode);
    if (resource == null ? void 0 : resource.code) {
      return createResourceAnchorContextPayload(resource, owner, canAct);
    }
    return createPropertyAnchorContextPayload({
      propertyInteraction: propertyInteractionForAnchor(anchorCode),
      owner,
      canAct
    });
  }
  function createWorldContextPayload({ owner, state, canAct }) {
    var _a;
    const available = owner.available || {};
    const resource = firstAvailableResource(optionalArray4(available.resourceNodes));
    const purchasableProperty = optionalArray4(available.purchasableProperties)[0] || null;
    const rental = optionalArray4(available.rentableProperties)[0] || null;
    const ownedProperties = optionalArray4(owner.properties);
    const characterId = label((_a = owner.character) == null ? void 0 : _a.id, "");
    const manageableProperties = propertyManagementCandidates(owner);
    const recoveryCase = firstOpenPropertyRecoveryCase(optionalArray4(owner.propertyRecoveryCases || available.propertyRecoveryCases));
    const ownedProperty = ownedProperties.find((property) => canUsePropertyStorage(property, characterId)) || manageableProperties.find((property) => canManageProperty(property, characterId, owner) && firstPropertyLock(property)) || ownedProperties.find((property) => firstPropertyLock(property)) || ownedProperties[0] || null;
    if (recoveryCase) {
      const pickupPropertyId = label(recoveryCase.pickupPropertyId || recoveryCase.propertyId, "");
      const recoveryPropertyName = label(
        recoveryCase.propertyName || recoveryCase.rootPropertyName || recoveryCase.propertyId,
        "Property Recovery"
      );
      const status = label(recoveryCase.status, "recovery");
      return {
        target: {
          type: "property_recovery",
          id: recoveryCase.id,
          label: `Recovery: ${recoveryPropertyName}`,
          details: [
            `Status: ${status}`,
            propertyRecoveryDeadlineLabel(recoveryCase),
            propertyRecoveryStorageLabel(recoveryCase),
            label(recoveryCase.notes, "")
          ].filter(Boolean)
        },
        actions: [
          {
            id: "refresh_property_recovery",
            label: "Refresh",
            message: { type: "rp.properties.refresh" },
            enabled: canAct
          },
          {
            id: "open_recovery_storage",
            label: "Pickup Storage",
            message: {
              type: "rp.property.storage.refresh",
              propertyId: pickupPropertyId
            },
            enabled: canAct && Boolean(pickupPropertyId)
          }
        ]
      };
    }
    const boardContext = createBoardContextPayload({ owner, state, canAct });
    if (boardContext.target) {
      return boardContext;
    }
    if (resource) {
      return createResourceAnchorContextPayload(resource, owner, canAct);
    }
    if (purchasableProperty) {
      const holdingsAction = openHoldingsContextAction(owner, "property_offer_gate", canAct);
      return {
        target: {
          type: "property",
          id: purchasableProperty.id,
          label: label(purchasableProperty.name || purchasableProperty.displayName || purchasableProperty.id, "Purchasable Property"),
          details: [
            propertyPurchaseLabel(purchasableProperty),
            purchasableProperty.propertyType ? `Type: ${purchasableProperty.propertyType}` : "",
            purchasableProperty.area ? `Area: ${purchasableProperty.area}` : ""
          ].filter(Boolean)
        },
        actions: [
          {
            id: "purchase_property",
            label: "Buy Deed",
            message: { type: "rp.property.purchase", propertyId: purchasableProperty.id },
            enabled: canAct && Boolean(purchasableProperty.id)
          },
          ...holdingsAction ? [holdingsAction] : []
        ]
      };
    }
    if (rental) {
      const holdingsAction = openHoldingsContextAction(owner, "property_offer_gate", canAct);
      return {
        target: {
          type: "property",
          id: rental.id,
          label: label(rental.name || rental.displayName || rental.id, "Rentable Property"),
          details: [
            propertyRentLabel(rental),
            rental.propertyType ? `Type: ${rental.propertyType}` : ""
          ].filter(Boolean)
        },
        actions: [
          {
            id: "rent_property",
            label: "Rent",
            message: { type: "rp.property.rent", propertyId: rental.id },
            enabled: canAct && Boolean(rental.id)
          },
          ...holdingsAction ? [holdingsAction] : []
        ]
      };
    }
    if (ownedProperty) {
      const ownedLock = firstPropertyLock(ownedProperty);
      const canManageOwnedProperty = canManageProperty(ownedProperty, characterId, owner);
      const canListOwnedDeed = canListPropertyDeed(ownedProperty, characterId);
      const canUseStorage = canUsePropertyStorage(ownedProperty, characterId);
      const inventoryItem = firstInventoryItem(owner);
      const storedItem = firstStoredItem(ownedProperty);
      const depositItemCode = label((inventoryItem == null ? void 0 : inventoryItem.itemCode) || (inventoryItem == null ? void 0 : inventoryItem.code), "");
      const withdrawItemCode = label((storedItem == null ? void 0 : storedItem.itemCode) || (storedItem == null ? void 0 : storedItem.code), "");
      const activeSaleListings = activePropertySaleListingCount(ownedProperty);
      const holdingsAction = openHoldingsContextAction(owner, "property_gate", canAct);
      return {
        target: {
          type: "property",
          id: ownedProperty.id,
          label: label(ownedProperty.name || ownedProperty.displayName || ownedProperty.id, "Property"),
          details: [
            ownedProperty.propertyType ? `Type: ${ownedProperty.propertyType}` : "",
            ownedProperty.status ? `Status: ${ownedProperty.status}` : "",
            guildPropertyControlDetail(ownedProperty, owner),
            activeSaleListings > 0 ? `Sale listings: ${activeSaleListings} active` : "",
            propertyStorageDetail(ownedProperty)
          ].filter(Boolean)
        },
        actions: [
          {
            id: "check_property_access",
            label: "Check Access",
            message: {
              type: "rp.property.access",
              propertyId: ownedProperty.id,
              requiredRoles: ["owner", "tenant", "steward", "guest"]
            },
            enabled: canAct && Boolean(ownedProperty.id)
          },
          {
            id: "refresh_property_storage",
            label: "Storage",
            message: {
              type: "rp.property.storage.refresh",
              propertyId: ownedProperty.id
            },
            enabled: canAct && canUseStorage && Boolean(ownedProperty.id)
          },
          {
            id: "deposit_property_storage",
            label: inventoryItem ? `Deposit ${label(inventoryItem.displayName || depositItemCode, "Item")}` : "Deposit",
            message: {
              type: "rp.property.storage.deposit",
              propertyId: ownedProperty.id,
              itemCode: depositItemCode,
              quantity: 1
            },
            enabled: canAct && canUseStorage && Boolean(ownedProperty.id && depositItemCode)
          },
          {
            id: "withdraw_property_storage",
            label: storedItem ? `Withdraw ${label(storedItem.displayName || withdrawItemCode, "Item")}` : "Withdraw",
            message: {
              type: "rp.property.storage.withdraw",
              propertyId: ownedProperty.id,
              itemCode: withdrawItemCode,
              quantity: 1
            },
            enabled: canAct && canUseStorage && Boolean(ownedProperty.id && withdrawItemCode)
          },
          ...canListOwnedDeed ? [{
            id: "create_property_sale_listing",
            label: "List Deed",
            message: {
              type: "rp.property.saleListing.create",
              propertyId: ownedProperty.id
            },
            requiresText: true,
            textPrompt: "Sale price in gold",
            enabled: canAct && Boolean(ownedProperty.id)
          }] : [],
          {
            id: "change_property_lock",
            label: "Change Lock",
            message: {
              type: "rp.property.lock.change",
              propertyId: ownedProperty.id,
              targetCode: ownedLock == null ? void 0 : ownedLock.targetCode,
              reason: "Changed lock from in-game property context"
            },
            enabled: canAct && canManageOwnedProperty && Boolean(ownedProperty.id && (ownedLock == null ? void 0 : ownedLock.targetCode))
          },
          {
            id: "refresh_property_locks",
            label: "Locks",
            message: {
              type: "rp.property.locks.refresh",
              propertyId: ownedProperty.id
            },
            enabled: canAct && Boolean(ownedProperty.id)
          },
          ...holdingsAction ? [holdingsAction] : []
        ]
      };
    }
    const courierContext = createCourierContextPayload({ owner, state, canAct });
    if (courierContext.target) {
      return courierContext;
    }
    const taxiContext = createTaxiContextPayload({ owner, state, canAct });
    if (taxiContext.target) {
      return taxiContext;
    }
    const commerceContext = createCommerceContextPayload({ owner, state, canAct });
    if (commerceContext.target) {
      return commerceContext;
    }
    const craftingContext = createCraftingContextPayload({ owner, state, canAct });
    if (craftingContext.target) {
      return craftingContext;
    }
    const medicalContext = createMedicalContextPayload({ owner, state, canAct });
    if (medicalContext.target) {
      return medicalContext;
    }
    const lawContext = createGuardPostContextPayload({ owner, state, canAct });
    if (lawContext.target) {
      return lawContext;
    }
    return {
      target: null,
      actions: []
    };
  }
  function countLabel(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
  }
  function createBoardContextPayload({ owner, state = {}, canAct, anchorCode = "" }) {
    const available = owner.available || {};
    const requestedBoardCode = label(anchorCode, "");
    const noticeBoards = optionalArray4(available.noticeBoards);
    const allNoticePosts = optionalArray4(available.noticeBoardPosts);
    const storageAuctionEvents = optionalArray4(available.storageAuctionEvents || owner.storageAuctionEvents);
    const storageAuctionLots = optionalArray4(available.storageAuctionLots || owner.storageAuctionLots);
    const selectedNoticeBoard = requestedBoardCode ? noticeBoards.find((board) => label(board == null ? void 0 : board.code, "") === requestedBoardCode) : noticeBoards[0] || null;
    const boardCode = label(
      requestedBoardCode || (selectedNoticeBoard == null ? void 0 : selectedNoticeBoard.code),
      ""
    );
    const noticePosts = boardCode ? allNoticePosts.filter((post) => label(post == null ? void 0 : post.boardCode, "") === boardCode) : allNoticePosts;
    const noticeBoard = selectedNoticeBoard || (boardCode ? noticeBoards.find((board) => label(board == null ? void 0 : board.code, "") === boardCode) : noticeBoards[0]) || null;
    const isTownHubBoard = ["riverwood_job_board", "whiterun_notice_board"].includes(boardCode);
    const openCourierDeliveries = courierBoardDeliveries(owner, state).filter((delivery) => !delivery.status || delivery.status === "open");
    const routes = taxiRoutes(owner, state);
    const openFares = openTaxiContracts(owner, state);
    const wanted = activeWantedRecords(owner, state);
    const medical = activeMedicalCalls(owner, state);
    if (!boardCode && !noticeBoard && storageAuctionEvents.length === 0 && storageAuctionLots.length === 0 && openCourierDeliveries.length === 0 && routes.length === 0 && openFares.length === 0 && wanted.length === 0 && medical.length === 0) {
      return { target: null, actions: [] };
    }
    const firstAuctionEvent = storageAuctionEvents[0] || null;
    const firstAuctionLot = storageAuctionLots[0] || null;
    const nextAuctionBid = auctionBidAmount(firstAuctionLot);
    return {
      target: {
        type: "notice_board",
        id: boardCode,
        label: noticeBoardDisplayLabel(noticeBoard, boardCode),
        details: [
          `${noticePosts.length} player post${noticePosts.length === 1 ? "" : "s"}`,
          `${storageAuctionEvents.length} storage event${storageAuctionEvents.length === 1 ? "" : "s"}`,
          `${storageAuctionLots.length} storage auction${storageAuctionLots.length === 1 ? "" : "s"}`,
          isTownHubBoard || openCourierDeliveries.length > 0 ? `${countLabel(openCourierDeliveries.length, "courier delivery", "courier deliveries")} open` : "",
          isTownHubBoard || routes.length > 0 || openFares.length > 0 ? `${countLabel(routes.length, "taxi route")} - ${countLabel(openFares.length, "open fare")}` : "",
          isTownHubBoard || wanted.length > 0 ? `${countLabel(wanted.length, "wanted record")} active` : "",
          isTownHubBoard || medical.length > 0 ? `${countLabel(medical.length, "medical call")} active` : "",
          ...noticePosts.slice(0, 3).map(noticeBoardDetail),
          ...storageAuctionEvents.slice(0, 2).map(storageAuctionEventDetail),
          ...storageAuctionLots.slice(0, 2).map(storageAuctionDetail)
        ]
      },
      actions: [
        {
          id: "view_notices",
          label: "Read Notices",
          message: { type: "rp.notices.refresh", boardCode },
          enabled: canAct && Boolean(boardCode)
        },
        {
          id: "post_notice",
          label: "Post Notice",
          message: { type: "rp.notice.post", boardCode },
          requiresText: true,
          textPrompt: "Write notice",
          enabled: canAct && Boolean(boardCode)
        },
        {
          id: "view_storage_auction_events",
          label: "Events",
          message: { type: "rp.storageAuction.events.refresh" },
          enabled: canAct
        },
        {
          id: "view_storage_auctions",
          label: "Auctions",
          message: {
            type: "rp.storageAuction.refresh",
            eventId: firstAuctionEvent == null ? void 0 : firstAuctionEvent.id
          },
          enabled: canAct
        },
        {
          id: firstAuctionLot ? `bid_storage_auction:${firstAuctionLot.id}` : "bid_storage_auction",
          label: firstAuctionLot ? `Bid ${nextAuctionBid}` : "Bid",
          message: {
            type: "rp.storageAuction.bid",
            lotId: firstAuctionLot == null ? void 0 : firstAuctionLot.id,
            amount: nextAuctionBid
          },
          enabled: canAct && Boolean(firstAuctionLot == null ? void 0 : firstAuctionLot.id)
        },
        {
          id: "view_courier_board",
          label: "Courier Board",
          message: { type: "rp.courier.refresh", status: "open" },
          enabled: canAct && (isTownHubBoard || openCourierDeliveries.length > 0)
        },
        {
          id: "view_taxi_board",
          label: "Taxi Board",
          message: { type: "rp.taxi.refresh" },
          enabled: canAct && (isTownHubBoard || routes.length > 0 || openFares.length > 0)
        },
        {
          id: "view_wanted_board",
          label: "Wanted Board",
          message: { type: "rp.wanted.refresh", status: "active", hold: "Whiterun" },
          enabled: canAct && (isTownHubBoard || wanted.length > 0)
        },
        {
          id: "view_medical_calls",
          label: "Medical Calls",
          message: { type: "rp.medical.refresh", status: "downed" },
          enabled: canAct && (isTownHubBoard || medical.length > 0)
        }
      ]
    };
  }
  function createWorldAnchorContextPayload({ owner, state, canAct, anchorCode }) {
    if (["riverwood_job_board", "whiterun_notice_board"].includes(label(anchorCode, ""))) {
      return createBoardContextPayload({ owner, state, canAct, anchorCode });
    }
    if (["riverwood_guard_post", "riverwood_jail_marker"].includes(label(anchorCode, ""))) {
      return createGuardPostContextPayload({ owner, state, canAct, anchorCode });
    }
    if ([
      "riverwood_commerce_board",
      "riverwood_market_stall_01",
      "riverwood_trader_shop",
      "riverwood_alvor_smithy",
      "riverwood_lumber_yard",
      "riverwood_sleeping_giant_inn"
    ].includes(label(anchorCode, ""))) {
      return createCommerceContextPayload({ owner, state, canAct, anchorCode });
    }
    if ([
      "riverwood_crafting_station",
      "riverwood_cooking_station",
      "riverwood_cooking_pot",
      "riverwood_forge",
      "riverwood_smithing_station",
      "riverwood_tanning_rack",
      "riverwood_tailoring_station",
      "riverwood_fletcher_station",
      "riverwood_alchemy_station",
      "riverwood_scribe_desk",
      "riverwood_enchanter_table",
      "riverwood_arcane_enchanter"
    ].includes(label(anchorCode, ""))) {
      return createCraftingContextPayload({ owner, state, canAct, anchorCode });
    }
    if (["riverwood_healer_station", "riverwood_infirmary_marker"].includes(label(anchorCode, ""))) {
      return createMedicalContextPayload({ owner, state, canAct, anchorCode });
    }
    if (["riverwood_courier_dropbox", "riverwood_room_mailbox_01"].includes(label(anchorCode, ""))) {
      return createCourierContextPayload({ owner, state, canAct, anchorCode });
    }
    if (label(anchorCode, "") === "riverwood_taxi_marker") {
      return createTaxiContextPayload({ owner, state, canAct, anchorCode });
    }
    return { target: null, actions: [] };
  }
  function pendingTradeOfferForPeer(state, owner, peer) {
    var _a, _b;
    const event = (state == null ? void 0 : state.lastTradeEvent) || null;
    const offer = (event == null ? void 0 : event.offer) || null;
    if ((event == null ? void 0 : event.type) !== "trade_offer_received" || !(offer == null ? void 0 : offer.id)) {
      return null;
    }
    const status = label(offer.status, "pending").toLowerCase();
    const buyerCharacterId = label(offer.buyerCharacterId, "");
    const sellerCharacterId = label(offer.sellerCharacterId, "");
    const ownerCharacterId = label(((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id) || ((_b = state == null ? void 0 : state.character) == null ? void 0 : _b.id), "");
    const peerCharacterId = label(peer == null ? void 0 : peer.characterId, "");
    if (status !== "pending") {
      return null;
    }
    if (buyerCharacterId && ownerCharacterId && buyerCharacterId !== ownerCharacterId) {
      return null;
    }
    if (sellerCharacterId && peerCharacterId && sellerCharacterId !== peerCharacterId) {
      return null;
    }
    return offer;
  }
  function createContextPayload({ state, owner, peers, allowWorldContext = false }) {
    const canAct = state.phase === "joined";
    const peer = aimedPeer(peers, state.position);
    if (!peer) {
      return allowWorldContext ? createWorldContextPayload({ owner, state, canAct }) : {
        target: null,
        actions: []
      };
    }
    const target = {
      type: "player",
      clientId: peer.clientId,
      characterId: peer.characterId || "",
      label: peer.overlayName || peer.displayName || "Unknown Character",
      identityKnown: peer.identityKnown === true
    };
    const targetDetails = [];
    const actions = [
      {
        id: "inspect",
        label: "Inspect",
        message: { type: "rp.peer.inspect", clientId: peer.clientId },
        enabled: canAct
      },
      {
        id: "introduce",
        label: "Introduce",
        message: { type: "rp.peer.introduce", clientId: peer.clientId },
        enabled: canAct && peer.identityKnown !== true
      },
      {
        id: "trade",
        label: "Trade",
        message: { type: "rp.peer.trade", clientId: peer.clientId },
        enabled: canAct
      }
    ];
    const pendingTradeOffer = pendingTradeOfferForPeer(state, owner, peer);
    if (pendingTradeOffer) {
      const offerItems = optionalArray4(pendingTradeOffer.items);
      const firstOfferItem = offerItems[0] || null;
      const offerLabel = firstOfferItem ? quantityItemLabel(firstOfferItem) : "Trade Offer";
      const price = Number(pendingTradeOffer.price || 0);
      actions.push({
        id: "accept_trade_offer",
        label: `Accept ${price}g`,
        message: {
          type: "rp.trade.offer.accept",
          offerId: pendingTradeOffer.id
        },
        enabled: canAct && Boolean(pendingTradeOffer.id)
      });
      targetDetails.push(`Pending trade: ${offerLabel} for ${price} gold`);
    }
    const tradeItem = firstInventoryItem(owner);
    const tradeItemCode = label((tradeItem == null ? void 0 : tradeItem.itemCode) || (tradeItem == null ? void 0 : tradeItem.code), "");
    if (tradeItemCode) {
      actions.push({
        id: "offer_trade_item",
        label: `Offer ${label(tradeItem.displayName || tradeItem.itemDisplayName || tradeItemCode, "Item")}`,
        message: {
          type: "rp.trade.offer.create",
          buyerCharacterId: peer.characterId,
          itemCode: tradeItemCode,
          quantity: 1
        },
        requiresText: true,
        textPrompt: "Price in gold",
        enabled: canAct && Boolean(peer.characterId)
      });
    }
    const keyProperty = firstManageablePropertyWithLock(owner);
    const keyLock = firstPropertyLock(keyProperty);
    const peerPropertyKey = keyProperty && keyLock ? firstActivePropertyKey(keyProperty, {
      targetCode: keyLock.targetCode,
      characterId: peer.characterId
    }) : null;
    if (keyProperty && keyLock) {
      actions.push({
        id: "issue_property_key",
        label: peerPropertyKey ? "Key Already Issued" : "Issue Key",
        message: {
          type: "rp.property.key.issue",
          propertyId: keyProperty.id,
          targetCode: keyLock.targetCode,
          targetCharacterId: peer.characterId,
          label: `${label(keyProperty.name || keyProperty.displayName || keyProperty.id, "Property")} Key`
        },
        enabled: canAct && !peerPropertyKey && Boolean(peer.characterId && keyProperty.id && keyLock.targetCode)
      });
      if (peerPropertyKey) {
        actions.push({
          id: "revoke_property_key",
          label: "Revoke Key",
          message: {
            type: "rp.property.key.revoke",
            propertyId: keyProperty.id,
            keyId: peerPropertyKey.id
          },
          enabled: canAct && Boolean(peerPropertyKey.id)
        });
      }
    }
    const guildManager = firstGuildMemberManager(owner);
    const managedGuildId = guildIdentifier(guildManager);
    const targetGuildMember = guildRosterMemberForCharacter(owner, guildManager, peer.characterId);
    target.details = [
      ...guildPeerTargetDetails({
        guildManager,
        targetGuildMember,
        keyProperty,
        keyLock,
        peerPropertyKey
      }),
      ...targetDetails
    ];
    if (guildManager && managedGuildId) {
      if (targetGuildMember) {
        if (guildEntryRankCodes.has(label(targetGuildMember.rankCode, "").toLowerCase())) {
          actions.push({
            id: "promote_guild_member",
            label: "Promote to Member",
            message: {
              type: "rp.guild.member.upsert",
              guildId: managedGuildId,
              targetCharacterId: peer.characterId,
              rankCode: "member",
              notes: "Promoted from in-game guild leader menu"
            },
            enabled: canAct && Boolean(peer.characterId)
          });
        }
        actions.push({
          id: "revoke_guild_member",
          label: `Remove ${label(guildManager.guildName || guildManager.guildCode, "Guild")}`,
          message: {
            type: "rp.guild.member.revoke",
            guildId: managedGuildId,
            targetCharacterId: peer.characterId,
            reason: "Removed from in-game guild leader menu"
          },
          enabled: canAct && Boolean(peer.characterId)
        });
      } else {
        actions.push({
          id: "recruit_guild_member",
          label: `Recruit ${label(guildManager.guildName || guildManager.guildCode, "Guild")}`,
          message: {
            type: "rp.guild.member.upsert",
            guildId: managedGuildId,
            targetCharacterId: peer.characterId,
            rankCode: "recruit",
            notes: "Recruited from in-game guild leader menu"
          },
          enabled: canAct && Boolean(peer.characterId)
        });
      }
    }
    const accessProperty = firstDirectManageableProperty(owner);
    if (accessProperty) {
      actions.push(
        {
          id: "grant_property_storage_access",
          label: "Grant Storage",
          message: {
            type: "rp.property.access.grant",
            propertyId: accessProperty.id,
            targetCharacterId: peer.characterId,
            role: "storage"
          },
          enabled: canAct && Boolean(peer.characterId && accessProperty.id)
        },
        {
          id: "grant_property_guest_access",
          label: "Invite Guest",
          message: {
            type: "rp.property.access.grant",
            propertyId: accessProperty.id,
            targetCharacterId: peer.characterId,
            role: "guest"
          },
          enabled: canAct && Boolean(peer.characterId && accessProperty.id)
        },
        {
          id: "revoke_property_storage_access",
          label: "Revoke Storage",
          message: {
            type: "rp.property.access.revoke",
            propertyId: accessProperty.id,
            targetCharacterId: peer.characterId,
            role: "storage"
          },
          enabled: canAct && Boolean(peer.characterId && accessProperty.id)
        }
      );
    }
    if (isGuardLike(owner)) {
      actions.push(
        {
          id: "search",
          label: "Search",
          message: { type: "rp.guard.search", characterId: peer.characterId },
          enabled: canAct && Boolean(peer.characterId)
        },
        {
          id: "cuff",
          label: "Cuff",
          message: { type: "rp.guard.cuff", characterId: peer.characterId },
          enabled: canAct && Boolean(peer.characterId)
        },
        {
          id: "arrest",
          label: "Arrest",
          message: { type: "rp.guard.arrest", characterId: peer.characterId },
          enabled: canAct && Boolean(peer.characterId)
        }
      );
    }
    if (isUnderworldLike(owner)) {
      actions.push({
        id: "pickpocket",
        label: "Pickpocket",
        message: { type: "rp.crime.pickpocket", characterId: peer.characterId },
        enabled: canAct && Boolean(peer.characterId)
      });
    }
    return {
      target,
      actions
    };
  }
  function currentWallet(owner, character) {
    var _a, _b, _c;
    const wallet = (_c = (_b = (_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.wallet) != null ? _b : character == null ? void 0 : character.wallet) != null ? _c : 0;
    const parsed = Number(wallet);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function activeCharacterIdForState(state, owner = {}) {
    var _a, _b, _c, _d;
    return label(((_a = owner == null ? void 0 : owner.character) == null ? void 0 : _a.id) || ((_b = state == null ? void 0 : state.character) == null ? void 0 : _b.id) || ((_d = (_c = state == null ? void 0 : state.ownerSnapshot) == null ? void 0 : _c.character) == null ? void 0 : _d.id), "");
  }
  function activeAuthForState(state, storage2 = {}, settings2 = {}) {
    var _a, _b;
    const storedAuth2 = (storage2 == null ? void 0 : storage2.skyrimRpAuth) || {};
    const settingsAccount = (settings2 == null ? void 0 : settings2.account) || {};
    const accountId = label(
      ((_a = state == null ? void 0 : state.auth) == null ? void 0 : _a.accountId) || storedAuth2.accountId || settings2.accountId || settingsAccount.accountId,
      ""
    );
    const sessionToken = label(
      ((_b = state == null ? void 0 : state.auth) == null ? void 0 : _b.sessionToken) || storedAuth2.sessionToken || settings2.sessionToken || settingsAccount.sessionToken,
      ""
    );
    return accountId && sessionToken ? { accountId, sessionToken } : null;
  }
  function canUseCharacterHttpActions(state, owner = {}, storage2 = {}, settings2 = {}) {
    return Boolean(activeAuthForState(state, storage2, settings2) && activeCharacterIdForState(state, owner));
  }
  function staleWorldLoadAction(message) {
    return typeof message === "string" && (message === "Loading world..." || message === "Starting world..." || message === "Loading test world..." || message === "Retrying world load with console command..." || message.startsWith("World load failed:"));
  }
  function professionRpGuidance(owner, pushToTalkKey2, chatFocusKey2, wallet, options = {}) {
    const primary = primaryProfession(owner);
    if (primary) {
      const levelInfo = professionLevelInfo(primary);
      const guide = professionGuideFor(primary.code);
      return {
        summary: "Profession",
        prompt: `${primary.displayName} level ${levelInfo.level}. ${levelInfo.needed} XP to next level. ${guide.firstAction}`,
        wallet
      };
    }
    if (publicProfessions(owner, { allowCatalogFallback: options.allowCatalogFallback === true }).length > 0) {
      return {
        summary: "Choose Profession",
        prompt: `Press K to choose your first profession. K is only for profession XP, recipes, crafting, and profession work. ${chatFocusKey2} opens text comms. PTT is ${pushToTalkKey2}.`,
        wallet
      };
    }
    return null;
  }
  function createRpGuidance({ state, world, owner, peers, pushToTalkKey: pushToTalkKey2, chatFocusKey: chatFocusKey2, overlayMode = "hud" }) {
    const character = owner.character || state.character || {};
    const wallet = currentWallet(owner, character);
    const jobs = optionalArray4(owner.jobs);
    const properties = optionalArray4(owner.properties);
    const charges = optionalArray4(owner.propertyCharges);
    const available = owner.available || {};
    const accountStipend = available.accountStipend || null;
    const resources = optionalArray4(available.resourceNodes);
    const rentals = optionalArray4(available.rentableProperties);
    const purchases = optionalArray4(available.purchasableProperties);
    const activeJob = jobs[0] || null;
    const resource = firstAvailableResource(resources);
    const rental = rentals[0] || null;
    const purchasableProperty = purchases[0] || null;
    const speakingPeer = firstSpeakingPeer(peers);
    const peer = firstUnknownPeer(peers);
    const activeCourierDelivery = firstClaimedCourierDelivery(owner, state);
    const activeTaxiContract = firstClaimedTaxiContract(owner, state);
    const activeJailTask = firstAssignedJailTask(owner, state);
    if (state.phase !== "joined") {
      return {
        summary: "Connect",
        prompt: "Choose a character and join the RP server.",
        wallet
      };
    }
    if (world.worldLoaded !== true) {
      return {
        summary: "Load World",
        prompt: `Load ${label(world.stage1LoadCell, "the RP cell")} to start RP systems.`,
        wallet
      };
    }
    if (owner.activeInjury) {
      return {
        summary: "Medical",
        prompt: "You have an active injury. Call or wait for healer support.",
        wallet
      };
    }
    if (owner.activeJailSentence && activeJailTask) {
      return {
        summary: "Jail Labor",
        prompt: `Complete ${label(activeJailTask.taskName || activeJailTask.taskCode, "assigned labor")} at the jail marker for ${compactSeconds(activeJailTask.creditSeconds || 0)} sentence credit.`,
        wallet
      };
    }
    if (owner.activeCuff || owner.activeArrest || owner.activeJailSentence) {
      return {
        summary: "Law",
        prompt: "You are under active law enforcement status.",
        wallet
      };
    }
    if (overlayMode === "skills") {
      const professionGuidance2 = professionRpGuidance(owner, pushToTalkKey2, chatFocusKey2, wallet, { allowCatalogFallback: true });
      if (professionGuidance2) {
        return professionGuidance2;
      }
    }
    if (activeJob) {
      return {
        summary: "Active Work",
        prompt: `Continue ${label(activeJob.jobDisplayName || activeJob.jobCode, "your active work")}.`,
        wallet
      };
    }
    if (activeCourierDelivery) {
      return {
        summary: "Courier",
        prompt: `Deliver ${label(activeCourierDelivery.subject, "the active courier delivery")} to ${label(activeCourierDelivery.deliveryLabel, "the recipient")}.`,
        wallet
      };
    }
    if (activeTaxiContract) {
      return {
        summary: "Taxi",
        prompt: `Drive ${label(activeTaxiContract.routeName || activeTaxiContract.routeCode, "the active taxi fare")} for ${Number(activeTaxiContract.fareGold || 0)} gold.`,
        wallet
      };
    }
    const professionGuidance = professionRpGuidance(owner, pushToTalkKey2, chatFocusKey2, wallet);
    if (professionGuidance) {
      return professionGuidance;
    }
    if (resource) {
      return {
        summary: "Resource",
        prompt: `Gather ${label(resource.displayName || resource.code, "a resource node")} for materials and profession XP.`,
        wallet
      };
    }
    if (purchasableProperty) {
      return {
        summary: "Property Deed",
        prompt: `Press H to review the ${label(purchasableProperty.name || purchasableProperty.id, "property")} deed for ${Number(purchasableProperty.purchasePrice || 0)} Skyrim gold.`,
        wallet
      };
    }
    if (rental) {
      return {
        summary: "Rent",
        prompt: `Press H to review the ${label(rental.name || rental.id, "room")} lease; rent uses your Skyrim gold wallet.`,
        wallet
      };
    }
    if (speakingPeer) {
      return {
        summary: "Nearby Voice",
        prompt: `${label(speakingPeer.displayName || speakingPeer.overlayName, "A nearby player")} is speaking in your cell. ${chatFocusKey2} opens text comms. PTT is ${pushToTalkKey2}.`,
        wallet
      };
    }
    if (peer) {
      return {
        summary: "Nearby Player",
        prompt: `Inspect or introduce to ${label(peer.displayName, "a nearby player")}.`,
        wallet
      };
    }
    if (charges.length > 0) {
      return {
        summary: "Charges",
        prompt: `Press H to review ${charges.length} property charge${charges.length === 1 ? "" : "s"} due. Wallet: ${wallet} Skyrim gold.`,
        wallet
      };
    }
    if (properties.length > 0) {
      return {
        summary: "Property",
        prompt: `Press H to manage ${properties.length} property record${properties.length === 1 ? "" : "s"}, keys, storage, and building. Wallet: ${wallet} Skyrim gold.`,
        wallet
      };
    }
    if (accountStipendReady(accountStipend)) {
      const amount = Number(accountStipend.amount || 0);
      return {
        summary: "Claim Gold",
        prompt: `Claim ${amount > 0 ? amount : "your"} Skyrim gold account stipend. Profession materials should come from gathering, crafting, services, and player trade.`,
        wallet
      };
    }
    return {
      summary: "RP Ready",
      prompt: `Press K for profession work, G for guilds, H for holdings, ${chatFocusKey2} for text comms. PTT is ${pushToTalkKey2}. Wallet: ${wallet} Skyrim gold.`,
      wallet
    };
  }
  function chatEventKey(event) {
    if (!event || typeof event !== "object") {
      return "";
    }
    const message = event.message || {};
    if (message.id) {
      return `${event.type}:${message.id}`;
    }
    return `${event.type}:${message.channel || message.kind || ""}:${message.displayName || ""}:${message.text || event.reason || ""}`;
  }
  function chatLogEntryFromEvent(event, receivedAt) {
    var _a, _b, _c;
    if (!event || typeof event !== "object") {
      return null;
    }
    if (event.type === "chat_denied") {
      const reason = label(event.reason, "muted");
      const retryAfterSeconds = Number(event.retryAfterSeconds || 0);
      const resetAt = shortDateLabel(event.resetAt);
      const mutedUntil = shortDateLabel(event.mutedUntil);
      const details = [
        retryAfterSeconds > 0 ? `retry in ${compactSeconds(retryAfterSeconds)}` : "",
        !retryAfterSeconds && resetAt ? `available after ${resetAt}` : "",
        mutedUntil ? `muted until ${mutedUntil}` : ""
      ].filter(Boolean);
      return {
        id: chatEventKey(event) || `chat-denied-${receivedAt}`,
        channel: "system",
        displayName: "System",
        text: `Chat denied: ${reason}${details.length > 0 ? ` (${details.join(", ")})` : ""}`,
        timestamp: receivedAt,
        system: true
      };
    }
    if (event.type === "staff_direct_message_sent" || event.type === "staff_direct_message_received") {
      const direction = event.type === "staff_direct_message_sent" ? "To" : "From";
      const peer = label(((_a = event.peer) == null ? void 0 : _a.displayName) || ((_b = event.message) == null ? void 0 : _b.displayName), "Staff");
      return {
        id: chatEventKey(event) || `staff-dm-${receivedAt}`,
        channel: "staff",
        displayName: `${direction} ${peer}`,
        text: label((_c = event.message) == null ? void 0 : _c.text, ""),
        timestamp: receivedAt,
        system: false
      };
    }
    if (event.type !== "chat_message") {
      return null;
    }
    const message = event.message || {};
    return __spreadProps(__spreadValues({
      id: chatEventKey(event) || `chat-${receivedAt}`,
      channel: label(message.kind || message.channel, "local"),
      displayName: label(message.displayName, "Unknown Character"),
      text: label(message.text, "")
    }, message.roll && typeof message.roll === "object" ? { roll: message.roll } : {}), {
      timestamp: message.createdAt || message.timestamp || receivedAt,
      identityKnown: message.identityKnown !== false,
      system: false
    });
  }
  function quantityItemLabel(item, fallbackCode = "item") {
    var _a, _b;
    const quantity = Math.abs(Number((_b = (_a = item == null ? void 0 : item.quantity) != null ? _a : item == null ? void 0 : item.quantityDelta) != null ? _b : 1)) || 1;
    const displayName = label((item == null ? void 0 : item.displayName) || (item == null ? void 0 : item.itemDisplayName) || (item == null ? void 0 : item.itemCode) || (item == null ? void 0 : item.code), fallbackCode);
    return `${quantity} ${displayName}`;
  }
  function professionXpDetail(professionProgress) {
    var _a, _b, _c, _d;
    const xpDelta = Number(((_a = professionProgress == null ? void 0 : professionProgress.entry) == null ? void 0 : _a.xpDelta) || (professionProgress == null ? void 0 : professionProgress.xpDelta) || 0);
    if (xpDelta <= 0) {
      return "";
    }
    const professionName = label(
      ((_b = professionProgress == null ? void 0 : professionProgress.profession) == null ? void 0 : _b.displayName) || ((_c = professionProgress == null ? void 0 : professionProgress.profession) == null ? void 0 : _c.name) || ((_d = professionProgress == null ? void 0 : professionProgress.profession) == null ? void 0 : _d.code),
      ""
    );
    return `+${xpDelta} ${professionName ? `${professionName} ` : ""}XP`;
  }
  function rpSystemEventKey(event) {
    var _a, _b, _c, _d;
    if (!event || typeof event !== "object") {
      return "";
    }
    if (event.type === "trade_result") {
      const trade = event.trade || {};
      return `trade_result:${trade.tradeId || trade.buyerCode || ""}:${trade.total || 0}`;
    }
    if (event.type === "trade_offer_created" || event.type === "trade_offer_received") {
      const offer = event.offer || {};
      return `${event.type}:${offer.id || ""}:${offer.sellerCharacterId || ""}:${offer.buyerCharacterId || ""}:${offer.price || 0}`;
    }
    if (event.type === "trade_offer_accepted") {
      const result = event.result || {};
      const offer = result.offer || {};
      return `trade_offer_accepted:${offer.id || ""}:${offer.status || ""}`;
    }
    if (event.type === "craft_result") {
      const craft = event.craft || {};
      return `craft_result:${craft.craftId || ((_a = craft.recipe) == null ? void 0 : _a.code) || ""}:${((_b = craft.produced) == null ? void 0 : _b.itemCode) || ""}:${((_c = craft.produced) == null ? void 0 : _c.quantity) || ""}`;
    }
    if (event.type === "spell_tome_learn_result") {
      const result = event.result || {};
      const spell = result.spell || {};
      return `spell_tome_learn_result:${spell.code || ""}:${result.consumedItemCode || ""}`;
    }
    if (event.type === "resource_gather_result") {
      const result = event.result || {};
      const node = event.node || result.node || {};
      const adjustment = result.inventoryAdjustment || {};
      return `resource_gather_result:${node.code || ""}:${adjustment.itemCode || node.itemCode || ""}:${adjustment.quantityDelta || node.yieldQuantity || ""}:${node.availableAt || ""}`;
    }
    if (event.type === "property_access_result" || event.type === "property_interact_result") {
      const property = event.property || {};
      const roles = optionalArray4(event.roles).map((role) => label((role == null ? void 0 : role.role) || (role == null ? void 0 : role.title) || role, "")).filter(Boolean).join("|");
      return [
        event.type,
        event.ledgerId || property.id || property.propertyId || "",
        event.characterId || "",
        event.interaction || "",
        event.target || "",
        event.allowed === true ? "allowed" : "denied",
        roles
      ].join(":");
    }
    if (event.type === "property_key_issue_result" || event.type === "property_key_revoke_result" || event.type === "property_key_changed") {
      const property = event.property || {};
      const key = event.key || {};
      return [
        event.type,
        label(property.id || property.propertyId, ""),
        label(key.id, ""),
        label(event.action, ""),
        label((_d = event.materialCost) == null ? void 0 : _d.ledgerId, "")
      ].join(":");
    }
    return "";
  }
  function propertyResultRoleDetail(event) {
    const roles = optionalArray4(event == null ? void 0 : event.roles).map((role) => label((role == null ? void 0 : role.title) || (role == null ? void 0 : role.role) || role, "")).filter(Boolean);
    if (roles.length > 0) {
      return `via ${roles.join(", ")}`;
    }
    const requiredRoles = optionalArray4(event == null ? void 0 : event.requiredRoles).map((role) => label(role, "")).filter(Boolean);
    return requiredRoles.length > 0 ? `needs ${requiredRoles.join(", ")}` : "";
  }
  function rpSystemLogEntryFromEvent(event, receivedAt) {
    var _a, _b, _c, _d, _e, _f;
    if (!event || typeof event !== "object") {
      return null;
    }
    let text5 = "";
    if (event.type === "trade_result") {
      const trade = event.trade || {};
      const sold = optionalArray4(trade.sold);
      const soldLabel = sold.length > 0 ? sold.slice(0, 2).map((item) => quantityItemLabel(item)).join(", ") : "goods";
      const extra = sold.length > 2 ? ` and ${sold.length - 2} more` : "";
      const wallet = Number(((_a = trade.character) == null ? void 0 : _a.wallet) || 0);
      text5 = `Sold ${soldLabel}${extra} for ${Number(trade.total || 0)} gold${wallet > 0 ? `; wallet ${wallet}` : ""}.`;
    } else if (event.type === "trade_offer_created" || event.type === "trade_offer_received") {
      const offer = event.offer || {};
      const items = optionalArray4(offer.items);
      const itemLabel = items.length > 0 ? items.slice(0, 2).map((item) => quantityItemLabel(item)).join(", ") : "goods";
      const extra = items.length > 2 ? ` and ${items.length - 2} more` : "";
      const peer = event.peer || {};
      const peerName = label(peer.displayName || peer.characterName || peer.characterId, "player");
      const direction = event.type === "trade_offer_received" ? `from ${peerName}` : `to ${peerName}`;
      text5 = `Trade offer ${direction}: ${itemLabel}${extra} for ${Number(offer.price || 0)} gold.`;
    } else if (event.type === "trade_offer_accepted") {
      const result = event.result || {};
      const offer = result.offer || {};
      const items = optionalArray4(offer.items);
      const itemLabel = items.length > 0 ? items.slice(0, 2).map((item) => quantityItemLabel(item)).join(", ") : "goods";
      const extra = items.length > 2 ? ` and ${items.length - 2} more` : "";
      text5 = `Trade accepted: ${itemLabel}${extra} for ${Number(offer.price || 0)} gold.`;
    } else if (event.type === "craft_result") {
      const craft = event.craft || {};
      const xp = professionXpDetail(craft.professionProgress);
      text5 = `Crafted ${quantityItemLabel(craft.produced, ((_b = craft.recipe) == null ? void 0 : _b.code) || "item")}${xp ? ` (${xp})` : ""}.`;
    } else if (event.type === "spell_tome_learn_result") {
      const result = event.result || {};
      const spell = result.spell || {};
      const spellName = label(spell.displayName || spell.name || spell.code, "spell");
      const tomeCode = label(result.consumedItemCode || result.itemCode, "");
      const tomeName = label(spell.spellTomeDisplayName || result.spellTomeDisplayName || humanizedCode(tomeCode, ""), "spell tome");
      text5 = `Learned ${spellName}${tomeName ? ` from ${tomeName}` : ""}.`;
    } else if (event.type === "resource_gather_result") {
      const result = event.result || {};
      const node = event.node || result.node || {};
      const adjustment = result.inventoryAdjustment || {};
      const gathered = quantityItemLabel({
        itemCode: adjustment.itemCode || node.itemCode,
        displayName: node.itemDisplayName,
        quantity: Math.abs(Number(adjustment.quantityDelta || node.yieldQuantity || 1))
      });
      const xp = professionXpDetail(result.professionProgress);
      text5 = `Gathered ${gathered} from ${label(node.displayName || node.code, "resource")}${xp ? ` (${xp})` : ""}.`;
    } else if (event.type === "property_access_result" || event.type === "property_interact_result") {
      const property = event.property || {};
      const propertyName = label(property.name || property.displayName || property.id || property.propertyId, "Property");
      const result = event.allowed === true ? "allowed" : "denied";
      const target = label(event.target, "");
      const detail = propertyResultRoleDetail(event);
      if (event.type === "property_interact_result") {
        const action = humanizedCode(event.interaction, "Interaction");
        text5 = `${propertyName} ${action}${target ? ` (${target})` : ""}: ${result}${detail ? ` ${detail}` : ""}.`;
      } else {
        text5 = `${propertyName} access check: ${result}${detail ? ` ${detail}` : ""}.`;
      }
    } else if (event.type === "property_key_issue_result" || event.type === "property_key_changed" && event.action === "issue") {
      const key = event.key || {};
      const keyName = label(key.label || key.lockDisplayName || ((_c = event.lock) == null ? void 0 : _c.displayName) || ((_d = event.lock) == null ? void 0 : _d.targetCode), "Property Key");
      const targetName = label(key.characterName || key.targetCharacterName || key.characterId, "");
      const material = event.materialCost ? quantityItemLabel({
        itemCode: event.materialCost.itemCode,
        displayName: event.materialCost.displayName || humanizedCode(event.materialCost.itemCode, event.materialCost.itemCode),
        quantity: Math.abs(Number(event.materialCost.quantityDelta || 1))
      }) : "";
      text5 = `Issued ${keyName}${targetName ? ` to ${targetName}` : ""}${material ? `; consumed ${material}` : ""}.`;
    } else if (event.type === "property_key_revoke_result" || event.type === "property_key_changed" && event.action === "revoke") {
      const key = event.key || {};
      const keyName = label(key.label || key.lockDisplayName || ((_e = event.lock) == null ? void 0 : _e.displayName) || ((_f = event.lock) == null ? void 0 : _f.targetCode), "Property Key");
      const targetName = label(key.characterName || key.characterId, "");
      text5 = `Revoked ${keyName}${targetName ? ` from ${targetName}` : ""}.`;
    }
    if (!text5) {
      return null;
    }
    return {
      id: rpSystemEventKey(event) || `${event.type}-${receivedAt}`,
      channel: "system",
      displayName: "System",
      text: text5,
      timestamp: receivedAt,
      system: true
    };
  }
  function createRpMenuController({
    browser: browser2,
    http: http2,
    joinClient: joinClient2,
    storage: storage2,
    settings: settings2,
    backendUrl: backendUrl2,
    pushToTalkKey: pushToTalkKey2 = "V",
    chatFocusKey: chatFocusKey2 = "Enter",
    startJoin: startJoin2,
    loadWorld = (_source, _force) => {
    },
    getWorldState = () => ({}),
    getRpOverview = defaultGetRpOverview,
    refreshRpOverview = (_reason) => __async(null, null, function* () {
      return false;
    }),
    reportBrowserStatus: reportBrowserStatus2 = (_label, _details) => {
    },
    logger = (_message) => {
    },
    now = () => Date.now()
  }) {
    let visible = false;
    let dirty = false;
    let lastUpdateAt = 0;
    let lastAction = null;
    let autoConnectOnReadyStarted = false;
    let playJoinStarted = false;
    let pendingPlayWorldStart = false;
    let menuFocused = false;
    let autoHiddenForWorld = false;
    let interactionHeld = false;
    let activatedWorldAnchorCode = null;
    let skillsOpen = false;
    let organizationsOpen = false;
    let organizationPanelMode = "holdings";
    let commsOpen = false;
    let commsPreviewUntil = 0;
    let suppressSkillsToggleUntil = 0;
    let suppressOrganizationsToggleUntil = 0;
    let requestedProfessionFocusCode = "";
    let lastSkillsProfessionRefreshAt = -Infinity;
    let chatLog = [];
    let seenChatEventKeys = /* @__PURE__ */ new Set();
    let localSpeaking = false;
    function markDirty() {
      dirty = true;
    }
    function setLastAction(message) {
      lastAction = message;
      markDirty();
    }
    function addChatEvent(event) {
      const key = chatEventKey(event);
      if (!key || seenChatEventKeys.has(key)) {
        return false;
      }
      const entry = chatLogEntryFromEvent(event, now());
      if (!entry) {
        return false;
      }
      seenChatEventKeys.add(key);
      chatLog = [...chatLog, entry].slice(-10);
      if (seenChatEventKeys.size > 30) {
        seenChatEventKeys = new Set(chatLog.map((item) => item.id).filter(Boolean));
      }
      markDirty();
      return true;
    }
    function addRpSystemEvent(event) {
      const key = rpSystemEventKey(event);
      if (!key || seenChatEventKeys.has(key)) {
        return false;
      }
      const entry = rpSystemLogEntryFromEvent(event, now());
      if (!entry) {
        return false;
      }
      seenChatEventKeys.add(key);
      chatLog = [...chatLog, entry].slice(-10);
      lastAction = entry.text;
      if (seenChatEventKeys.size > 30) {
        seenChatEventKeys = new Set(chatLog.map((item) => item.id).filter(Boolean));
      }
      markDirty();
      return true;
    }
    function consumeStoredChatEvents() {
      const events = [];
      if (Array.isArray(storage2.skyrimRpChatEvents)) {
        events.push(...storage2.skyrimRpChatEvents);
      }
      if (storage2.skyrimRpChatEvent) {
        events.push(storage2.skyrimRpChatEvent);
      }
      for (const event of events) {
        addChatEvent(event);
      }
      for (const event of [
        storage2.skyrimRpResourceEvent,
        storage2.skyrimRpCraftEvent,
        storage2.skyrimRpSpellEvent,
        storage2.skyrimRpTradeEvent,
        storage2.skyrimRpPropertyEvent
      ]) {
        addRpSystemEvent(event);
      }
    }
    function notifyChatEvent(event) {
      const added = addChatEvent(event);
      if (added && inWorldOverlayActive() && !commsOpen) {
        commsPreviewUntil = now() + 1e4;
        interactionHeld = false;
        activatedWorldAnchorCode = null;
        skillsOpen = false;
        organizationsOpen = false;
        menuFocused = false;
        safeBrowser(() => {
          var _a, _b;
          browser2.setVisible(true);
          browser2.setFocused(false);
          visible = true;
          markDirty();
          reportStatus("comms_preview", { channel: ((_a = event == null ? void 0 : event.message) == null ? void 0 : _a.kind) || ((_b = event == null ? void 0 : event.message) == null ? void 0 : _b.channel) || (event == null ? void 0 : event.type) || "chat" });
        }, "comms-preview");
      }
      return added;
    }
    function settingEnabled2(value, defaultValue = false) {
      if (value === void 0 || value === null) {
        return defaultValue;
      }
      if (typeof value === "boolean") {
        return value;
      }
      if (typeof value === "string") {
        return value.trim().toLowerCase() !== "false";
      }
      return Boolean(value);
    }
    function settingValue(name) {
      if (!settings2 || typeof settings2 !== "object") {
        return void 0;
      }
      if (Object.prototype.hasOwnProperty.call(settings2, name)) {
        return settings2[name];
      }
      const normalizedName = name.toLowerCase();
      const entry = Object.entries(settings2).find(([key]) => key.toLowerCase() === normalizedName);
      return entry ? entry[1] : void 0;
    }
    function safeBrowser(action, label2) {
      try {
        action();
      } catch (error) {
        logger(`menu ${label2} failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      }
    }
    function reportStatus(label2, details = {}) {
      Promise.resolve(reportBrowserStatus2(label2, details)).catch((error) => {
        logger(`menu diagnostic failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      });
    }
    function inWorldOverlayActive() {
      const world = getWorldState() || {};
      return world.worldLoaded === true;
    }
    function startWorldFromMainMenu(reason) {
      pendingPlayWorldStart = false;
      setLastAction("Starting world...");
      loadWorld(reason, true);
      hide();
      sendUpdate(reason);
      return true;
    }
    function setMenuFocus(focused) {
      menuFocused = Boolean(focused) && inWorldOverlayActive();
      interactionHeld = false;
      activatedWorldAnchorCode = null;
      skillsOpen = false;
      organizationsOpen = false;
      safeBrowser(() => {
        browser2.setVisible(true);
        browser2.setFocused(menuFocused);
        visible = true;
        markDirty();
        reportStatus("focus", { focused: menuFocused });
      }, "focus");
      return menuFocused;
    }
    function setInteractionHeld(held) {
      const inWorld = inWorldOverlayActive();
      if (!inWorld) {
        interactionHeld = false;
        menuFocused = false;
        activatedWorldAnchorCode = null;
        return false;
      }
      const active = Boolean(held);
      if (interactionHeld === active && visible === active && menuFocused === false) {
        return interactionHeld;
      }
      interactionHeld = active;
      menuFocused = false;
      activatedWorldAnchorCode = null;
      if (active) {
        skillsOpen = false;
        organizationsOpen = false;
        commsOpen = false;
        commsPreviewUntil = 0;
      }
      safeBrowser(() => {
        browser2.setVisible(active);
        browser2.setFocused(false);
        visible = active;
        markDirty();
        reportStatus(active ? "interaction_show" : "interaction_hide", { held: active });
      }, "interaction");
      return interactionHeld;
    }
    function setSkillsOpen(open) {
      const active = Boolean(open) && inWorldOverlayActive();
      const wasOpen = skillsOpen;
      if (skillsOpen === active && visible === active && menuFocused === active) {
        return skillsOpen;
      }
      skillsOpen = active;
      interactionHeld = false;
      activatedWorldAnchorCode = null;
      organizationsOpen = false;
      commsOpen = false;
      commsPreviewUntil = 0;
      menuFocused = active;
      safeBrowser(() => {
        browser2.setVisible(active);
        browser2.setFocused(active);
        visible = active;
        markDirty();
        reportStatus(active ? "skills_show" : "skills_hide", { open: active });
      }, "skills");
      if (active && !wasOpen) {
        requestProfessionRefreshForSkillsOpen();
      }
      return skillsOpen;
    }
    function requestProfessionRefreshForSkillsOpen() {
      const state = joinClient2.getState();
      if (state.phase !== "joined") {
        return;
      }
      const nowMs = now();
      if (nowMs - lastSkillsProfessionRefreshAt < 3e3) {
        return;
      }
      lastSkillsProfessionRefreshAt = nowMs;
      const accepted = typeof joinClient2.requestProfessionMemberships === "function" ? joinClient2.requestProfessionMemberships() : false;
      reportStatus("skills_profession_refresh", { accepted: Boolean(accepted) });
      void refreshRpOverview("skills_open").catch((error) => {
        logger(`profession overview refresh failed: ${(error == null ? void 0 : error.message) || String(error)}`);
      });
    }
    function toggleSkillsPanel() {
      if (!skillsOpen && now() < suppressSkillsToggleUntil) {
        return false;
      }
      return setSkillsOpen(!skillsOpen);
    }
    function organizationUnavailableMessage(mode = organizationPanelMode) {
      return normalizeOrganizationPanelMode(mode) === "guilds" ? "No guild membership, rank, due, contract, or leader authority is active yet." : "No holding, property, business, charge, deed, lease, or sale panel is available yet.";
    }
    function currentOwnerForPanelAccess() {
      const state = joinClient2.getState();
      return getRpOverview() || state.ownerSnapshot || {};
    }
    function canOpenOrganizationPanel(mode) {
      const requestedMode = normalizeOrganizationPanelMode(mode);
      if (requestedMode !== "guilds") {
        return true;
      }
      return hasOrganizationPanelAccess(currentOwnerForPanelAccess(), "guilds");
    }
    function setOrganizationsOpen(open, mode = organizationPanelMode) {
      const requestedMode = normalizeOrganizationPanelMode(mode);
      const requestedOpen = Boolean(open);
      if (requestedOpen && !canOpenOrganizationPanel(requestedMode)) {
        return false;
      }
      const active = requestedOpen && inWorldOverlayActive();
      if (organizationsOpen === active && organizationPanelMode === requestedMode && visible === active && menuFocused === active) {
        return organizationsOpen;
      }
      organizationsOpen = active;
      organizationPanelMode = requestedMode;
      interactionHeld = false;
      activatedWorldAnchorCode = null;
      skillsOpen = false;
      commsOpen = false;
      commsPreviewUntil = 0;
      menuFocused = active;
      safeBrowser(() => {
        browser2.setVisible(active);
        browser2.setFocused(active);
        visible = active;
        markDirty();
        reportStatus(active ? "organizations_show" : "organizations_hide", { open: active, mode: organizationPanelMode });
      }, "organizations");
      return organizationsOpen;
    }
    function toggleOrganizationsPanel(mode = "holdings") {
      const requestedMode = normalizeOrganizationPanelMode(mode);
      if (organizationsOpen && organizationPanelMode !== requestedMode) {
        const opened2 = setOrganizationsOpen(true, requestedMode);
        if (!opened2) {
          setLastAction(organizationUnavailableMessage(requestedMode));
          sendUpdate("organizations_unavailable");
        }
        return opened2;
      }
      if (!organizationsOpen && now() < suppressOrganizationsToggleUntil) {
        return false;
      }
      const requestedOpen = !organizationsOpen;
      const opened = setOrganizationsOpen(requestedOpen, requestedMode);
      if (requestedOpen && !opened) {
        setLastAction(organizationUnavailableMessage(requestedMode));
        sendUpdate("organizations_unavailable");
      }
      return opened;
    }
    function toggleGuildsPanel() {
      return toggleOrganizationsPanel("guilds");
    }
    function setCommsOpen(open) {
      const active = Boolean(open) && inWorldOverlayActive();
      if (commsOpen === active && visible === active && menuFocused === active) {
        return commsOpen;
      }
      consumeStoredChatEvents();
      commsOpen = active;
      commsPreviewUntil = 0;
      interactionHeld = false;
      activatedWorldAnchorCode = null;
      skillsOpen = false;
      organizationsOpen = false;
      menuFocused = active;
      safeBrowser(() => {
        browser2.setVisible(active);
        browser2.setFocused(active);
        visible = active;
        markDirty();
        reportStatus(active ? "comms_show" : "comms_hide", { open: active });
      }, "comms");
      return commsOpen;
    }
    function toggleCommsPanel() {
      return setCommsOpen(!commsOpen);
    }
    function setLocalSpeaking(speaking) {
      const active = Boolean(speaking) && inWorldOverlayActive();
      if (localSpeaking === active) {
        return localSpeaking;
      }
      localSpeaking = active;
      if (active) {
        menuFocused = false;
        safeBrowser(() => {
          browser2.setVisible(true);
          browser2.setFocused(false);
          visible = true;
          markDirty();
          reportStatus("local_voice_show", { speaking: true });
        }, "local-voice");
      } else if (visible && !menuFocused && !interactionHeld && !commsOpen && commsPreviewUntil <= now()) {
        hide();
      } else {
        markDirty();
      }
      return localSpeaking;
    }
    function toggleMenuFocus() {
      return setMenuFocus(!menuFocused);
    }
    function toggleVisibility() {
      if (visible) {
        hide();
        return false;
      }
      show(false);
      return true;
    }
    function payload(reason) {
      var _a;
      const state = joinClient2.getState();
      const world = getWorldState() || {};
      const rpOverview = getRpOverview();
      const ownerSnapshot = state.ownerSnapshot || null;
      const owner = rpOverview || ownerSnapshot || {};
      const peers = Object.values(state.peers || {});
      const canAct = state.phase === "joined";
      const professionCanAct = canAct || canUseCharacterHttpActions(state, owner, storage2, settings2);
      const inWorld = world.worldLoaded === true;
      const joinedNeedsWorld = state.phase === "joined" && world.worldLoaded !== true;
      const allowWorldContext = settingEnabled2(settingValue("xWorldContextEnabled"), false) || settingEnabled2(settingValue("debugMenuEnabled"), false);
      const activatedContext = activatedWorldAnchorCode ? createActivatedAnchorContextPayload({
        owner,
        state,
        canAct,
        anchorCode: activatedWorldAnchorCode
      }) : null;
      const context = (activatedContext == null ? void 0 : activatedContext.target) ? activatedContext : createContextPayload({ state, owner, peers, allowWorldContext });
      const hasContext = Boolean(context == null ? void 0 : context.target) || optionalArray4(context == null ? void 0 : context.actions).length > 0;
      const contextOpen = interactionHeld && hasContext || Boolean(activatedContext == null ? void 0 : activatedContext.target);
      consumeStoredChatEvents();
      const commsPreviewActive = inWorld && !commsOpen && commsPreviewUntil > now();
      const currentAction = inWorld && staleWorldLoadAction(lastAction) ? null : lastAction;
      const actionError = inWorld ? (_a = state.lastRelayActionError) == null ? void 0 : _a.error : null;
      const needsCharacterSelection = state.phase === "selecting_character" && !state.character;
      const overlayMode = inWorld ? contextOpen ? "interaction" : skillsOpen ? "skills" : organizationsOpen ? "organizations" : commsOpen ? "comms" : commsPreviewActive ? "comms-preview" : menuFocused ? "rp-menu" : "hud" : "menu";
      const rpGuidance = createRpGuidance({ state, world, owner, peers, pushToTalkKey: pushToTalkKey2, chatFocusKey: chatFocusKey2, overlayMode });
      const displayAction = inWorld ? menuFocused || skillsOpen || organizationsOpen || currentAction ? currentAction || actionError || rpGuidance.prompt || "RP systems online." : "RP systems online." : joinedNeedsWorld ? currentAction || (world.worldLoadPending || world.worldLoadAttempted ? "Loading world..." : "Ready.") : currentAction;
      const professionsActive = overlayMode === "skills";
      const organizationsActive = overlayMode === "organizations";
      const professionFocusCode = professionsActive ? requestedProfessionFocusCode : "";
      const organizationSummary = organizationsActive ? guildSummaryForPayload(owner, organizationPanelMode) : null;
      const rpOverviewPayload = professionsActive ? professionSurfaceOverview(rpOverview) : organizationsActive ? organizationSurfaceOverview(rpOverview, organizationPanelMode) : rpOverview;
      const ownerSnapshotPayload = professionsActive ? professionSurfaceOverview(ownerSnapshot) : organizationsActive ? organizationSurfaceOverview(ownerSnapshot, organizationPanelMode) : ownerSnapshot;
      return __spreadProps(__spreadValues(__spreadProps(__spreadValues({
        reason,
        overlayMode,
        menuFocused,
        interactionHeld: contextOpen,
        activatedWorldAnchorCode,
        skillsOpen,
        organizationsOpen,
        organizationPanelMode,
        commsOpen,
        localSpeaking: localSpeaking || state.speaking === true,
        phase: state.phase,
        backendUrl: backendUrl2,
        serverId: settings2.serverId || "main",
        relayHost: settings2.relayHost || "127.0.0.1",
        relayPort: Number(settings2.relayPort || 3118),
        pushToTalk: pushToTalkKey2,
        chatFocus: chatFocusKey2,
        character: state.character,
        characterSlots: state.characterSlots,
        needsCharacterSelection,
        queue: state.queue,
        rpOverview: rpOverviewPayload,
        ownerSnapshot: ownerSnapshotPayload,
        rpGuidance,
        professionView: professionsActive ? professionViewStateForPayload(owner) : null,
        professionGuides: professionsActive ? professionGuidesForPayload(owner) : {},
        professionCanAct,
        professionOpportunities: professionsActive ? professionOpportunitiesForPayload({
          owner,
          state,
          canAct: professionCanAct
        }) : {}
      }, professionFocusCode ? { selectedProfessionCode: professionFocusCode } : {}), {
        guildSummary: organizationSummary,
        organizationSummary,
        contextTarget: context.target,
        contextActions: context.actions
      }), world), {
        serverStatus: storage2.skyrimRpServerStatus || null,
        lastAction: displayAction,
        joined: Boolean(state.welcome),
        peerCount: peers.length,
        peers,
        chatLog,
        error: inWorld ? actionError : state.lastError
      });
    }
    function sendUpdate(reason) {
      safeBrowser(() => {
        const update = payload(reason);
        browser2.executeJavaScript(`window.skyrimRpMenuUpdate && window.skyrimRpMenuUpdate(${JSON.stringify(update)});`);
        if (update.selectedProfessionCode) {
          requestedProfessionFocusCode = "";
        }
        lastUpdateAt = now();
        dirty = false;
        if (reason !== "tick" && reason !== "heartbeat") {
          reportStatus("update", { reason, phase: update.phase });
        }
      }, "update");
    }
    function show(focused = true) {
      safeBrowser(() => {
        const inWorld = inWorldOverlayActive();
        browser2.setVisible(true);
        interactionHeld = false;
        activatedWorldAnchorCode = null;
        skillsOpen = false;
        organizationsOpen = false;
        commsOpen = false;
        commsPreviewUntil = 0;
        menuFocused = inWorld ? Boolean(focused) : false;
        if (inWorld) {
          autoHiddenForWorld = true;
        }
        browser2.setFocused(inWorld ? menuFocused : focused);
        visible = true;
        markDirty();
        reportStatus("show", { focused: inWorld ? menuFocused : focused });
      }, "show");
    }
    function hide() {
      safeBrowser(() => {
        browser2.setFocused(false);
        browser2.setVisible(false);
        interactionHeld = false;
        activatedWorldAnchorCode = null;
        skillsOpen = false;
        organizationsOpen = false;
        commsOpen = false;
        commsPreviewUntil = 0;
        menuFocused = false;
        visible = false;
      }, "hide");
    }
    function refreshServerStatus() {
      return __async(this, null, function* () {
        try {
          const serverId = settings2.serverId || "main";
          storage2.skyrimRpServerStatus = yield http2.get(`/server/status?serverId=${encodeURIComponent(serverId)}`);
          markDirty();
          return storage2.skyrimRpServerStatus;
        } catch (error) {
          logger(`server status failed: ${(error == null ? void 0 : error.message) || String(error)}`);
          return null;
        }
      });
    }
    function parseMessage(rawMessage) {
      if (typeof rawMessage === "string") {
        return JSON.parse(rawMessage);
      }
      return rawMessage;
    }
    function handleBrowserMessage(event) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d, _e;
        let message;
        try {
          message = parseMessage((_a = event == null ? void 0 : event.arguments) == null ? void 0 : _a[0]);
        } catch (error) {
          logger(`menu message parse failed: ${(error == null ? void 0 : error.message) || String(error)}`);
          return false;
        }
        if ((message == null ? void 0 : message.type) !== "rp.heartbeat") {
          reportStatus("message", {
            type: (message == null ? void 0 : message.type) || null,
            argumentsCount: Array.isArray(event == null ? void 0 : event.arguments) ? event.arguments.length : 0
          });
        }
        if ((message == null ? void 0 : message.type) === "rp.play") {
          const state = joinClient2.getState();
          if (inWorldOverlayActive() && state.phase === "joined") {
            setLastAction("RP systems online.");
            sendUpdate("in-world");
            return true;
          }
          const world = getWorldState() || {};
          if (state.phase === "joined" && world.worldLoaded !== true) {
            return startWorldFromMainMenu("start-world");
          }
          playJoinStarted = true;
          pendingPlayWorldStart = true;
          setLastAction("Joining server...");
          sendUpdate("play-start");
          try {
            yield startJoin2();
            const joinedState = joinClient2.getState();
            const joinedWorld = getWorldState() || {};
            if (joinedState.phase === "selecting_character" && !joinedState.character) {
              playJoinStarted = false;
              pendingPlayWorldStart = false;
              setLastAction("Choose a character.");
              sendUpdate("character-selection");
              return true;
            }
            if (joinedState.phase === "joined" && joinedWorld.worldLoaded !== true) {
              return startWorldFromMainMenu("start-world");
            }
            setLastAction("Waiting for server welcome...");
            sendUpdate("play-connected");
          } catch (error) {
            logger(`join failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            playJoinStarted = false;
            pendingPlayWorldStart = false;
            setLastAction(`Join failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            show(true);
          }
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.character.select") {
          playJoinStarted = true;
          pendingPlayWorldStart = true;
          setLastAction("Loading character...");
          sendUpdate("character-select-start");
          try {
            yield joinClient2.selectCharacter(label(message.characterId, ""));
            const joinedState = joinClient2.getState();
            const joinedWorld = getWorldState() || {};
            if (joinedState.phase === "joined" && joinedWorld.worldLoaded !== true) {
              return startWorldFromMainMenu("start-world");
            }
            setLastAction("Waiting for server welcome...");
            sendUpdate("character-select-connected");
          } catch (error) {
            logger(`character select failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            playJoinStarted = false;
            pendingPlayWorldStart = false;
            setLastAction(`Character failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            show(true);
          }
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.character.create") {
          playJoinStarted = true;
          pendingPlayWorldStart = true;
          setLastAction("Creating character...");
          sendUpdate("character-create-start");
          try {
            yield joinClient2.createCharacter({
              name: label(message.name, "")
            });
            const joinedState = joinClient2.getState();
            const joinedWorld = getWorldState() || {};
            if (joinedState.phase === "joined" && joinedWorld.worldLoaded !== true) {
              return startWorldFromMainMenu("start-world");
            }
            setLastAction("Waiting for server welcome...");
            sendUpdate("character-create-connected");
          } catch (error) {
            logger(`character create failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            playJoinStarted = false;
            pendingPlayWorldStart = false;
            setLastAction(`Character failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            show(true);
          }
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.menu.focus") {
          setMenuFocus(message.focused !== false);
          sendUpdate("menu-focus");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.menu.blur") {
          setMenuFocus(false);
          sendUpdate("menu-blur");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.interaction.action") {
          const action = optionalArray4(payload("interaction").contextActions).find((entry) => entry.id === message.actionId);
          if (!action || action.enabled === false || !action.message) {
            setLastAction("Action unavailable.");
            sendUpdate("interaction-denied");
            return true;
          }
          const nextMessage = __spreadValues({}, action.message);
          if (typeof message.text === "string") {
            nextMessage.text = message.text;
          }
          return handleBrowserMessage({ arguments: [nextMessage] });
        }
        if ((message == null ? void 0 : message.type) === "rp.loadWorld") {
          if (inWorldOverlayActive()) {
            setLastAction("RP systems online.");
            sendUpdate("in-world");
            return true;
          }
          setLastAction("Click Play to enter the world.");
          show(true);
          sendUpdate("load-world-ignored");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.ready") {
          if (inWorldOverlayActive()) {
            hide();
          } else {
            show(true);
          }
          sendUpdate("ready");
          const autoConnectOnMenuReady = settingValue("autoConnectOnMenuReady");
          reportStatus("ready_auto_connect", {
            raw: autoConnectOnMenuReady,
            enabled: settingEnabled2(autoConnectOnMenuReady, false),
            alreadyStarted: autoConnectOnReadyStarted
          });
          if (settingEnabled2(autoConnectOnMenuReady, false) && !autoConnectOnReadyStarted) {
            autoConnectOnReadyStarted = true;
            try {
              yield startJoin2();
              sendUpdate("auto-connect-ready");
            } catch (error) {
              logger(`join failed: ${(error == null ? void 0 : error.message) || String(error)}`);
              show(true);
            }
          }
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.heartbeat") {
          joinClient2.tick();
          sendUpdate("heartbeat");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.refresh") {
          yield refreshServerStatus();
          sendUpdate("refresh");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.close") {
          if (message.source === "browser_k") {
            suppressSkillsToggleUntil = now() + 500;
          } else if (["browser_h", "browser_g"].includes(message.source)) {
            suppressOrganizationsToggleUntil = now() + 500;
          }
          hide();
          reportStatus("overlay_close", { source: label(message.source, "browser") });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.professions.open") {
          requestedProfessionFocusCode = label(message.professionCode, "").toLowerCase();
          const opened = setSkillsOpen(true);
          if (!opened) {
            requestedProfessionFocusCode = "";
            setLastAction("Profession HUD is unavailable until you are in world.");
          }
          sendUpdate(opened ? "skills_open" : "skills_unavailable");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.organizations.open") {
          const opened = setOrganizationsOpen(true, message.mode || "holdings");
          if (!opened) {
            setLastAction(organizationUnavailableMessage(message.mode || "holdings"));
          }
          sendUpdate(opened ? "organizations_open" : "organizations_unavailable");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guilds.open") {
          const opened = setOrganizationsOpen(true, "guilds");
          if (!opened) {
            setLastAction(organizationUnavailableMessage("guilds"));
          }
          sendUpdate(opened ? "guilds_open" : "guilds_unavailable");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.comms.open") {
          const opened = setCommsOpen(true);
          if (!opened) {
            setLastAction("Comms are unavailable until you are in world.");
          }
          sendUpdate(opened ? "comms_open" : "comms_unavailable");
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.overview.refresh") {
          yield runJoinedAction("Refreshing RP overview", () => __async(null, null, function* () {
            return refreshRpOverview("menu_action");
          }));
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.account.stipend.claim") {
          yield runJoinedAction("Claiming account gold", () => joinClient2.claimAccountStipend(), {
            success: "Account gold claimed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.onboarding.portal.approve") {
          if (typeof joinClient2.approveOnboardingPortal !== "function") {
            setLastAction("Onboarding portal approval is unavailable.");
            sendUpdate("onboarding-portal-unavailable");
            return true;
          }
          const destination = onboardingDestinationForCode(message.destinationCode);
          const destinationName = label((destination == null ? void 0 : destination.displayName) || message.destinationCode, "starter town");
          yield runJoinedAction(`Choosing ${destinationName}`, () => joinClient2.approveOnboardingPortal(message.destinationCode), {
            success: `${destinationName} portal approved. Character start position saved.`,
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.jobs.refresh") {
          yield runJoinedAction("Refreshing optional contracts", () => joinClient2.requestJobBoard(message.boardCode || null), {
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.notices.refresh") {
          yield runJoinedAction("Refreshing town notices", () => joinClient2.requestNoticeBoardPosts(message.boardCode || null), {
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.notice.post") {
          const text5 = typeof message.text === "string" ? message.text.trim() : "";
          if (!text5) {
            setLastAction("Notice text required.");
            sendUpdate("notice-post-empty");
            return true;
          }
          const title = text5.split(/\r?\n/)[0].slice(0, 70);
          yield runJoinedAction("Posting town notice", () => joinClient2.createNoticeBoardPost({
            boardCode: message.boardCode || null,
            title: title || "Town Notice",
            body: text5,
            category: message.category || "notice",
            expiresInDays: Number(message.expiresInDays || 7)
          }), {
            success: "Notice posted.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.job.claim") {
          yield runJoinedAction("Claiming work notice", () => joinClient2.claimJob(message.jobCode), {
            success: "Work notice claimed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.job.complete") {
          yield runJoinedAction("Completing work", () => joinClient2.completeJob(message.claimId), {
            success: "Work completion sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.courier.refresh") {
          yield runJoinedAction("Refreshing courier deliveries", () => joinClient2.requestCourierDeliveries({
            status: message.status || "open"
          }), {
            success: "Courier deliveries requested.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.courier.claim") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const gate = courierGate(owner, state.phase === "joined");
          if (!gate.enabled) {
            setLastAction(`Courier unavailable: ${gate.reasons.join(", ")}.`);
            sendUpdate("courier-claim-denied");
            return true;
          }
          yield runJoinedAction("Claiming courier delivery", () => joinClient2.claimCourierDelivery(message.deliveryId), {
            success: "Courier delivery claim sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.courier.complete") {
          yield runJoinedAction("Completing courier delivery", () => joinClient2.completeCourierDelivery(message.deliveryId), {
            success: "Courier delivery completion sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.taxi.refresh") {
          yield runJoinedAction("Refreshing taxi board", () => __async(null, null, function* () {
            const routesAccepted = yield joinClient2.requestTaxiRoutes({ status: "active" });
            const contractsAccepted = yield joinClient2.requestTaxiContracts({ status: "open" });
            return routesAccepted || contractsAccepted;
          }), {
            success: "Taxi board requested.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.taxi.request") {
          yield runJoinedAction("Requesting taxi ride", () => {
            var _a2;
            return joinClient2.createTaxiContract({
              routeCode: message.routeCode,
              fareGold: (_a2 = message.fareGold) != null ? _a2 : null,
              pickupNote: message.pickupNote || "Requested from in-game taxi marker.",
              destinationNote: message.destinationNote || ""
            });
          }, {
            success: "Taxi request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.taxi.claim") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const gate = courierGate(owner, state.phase === "joined");
          if (!gate.enabled) {
            setLastAction(`Taxi unavailable: ${gate.reasons.join(", ")}.`);
            sendUpdate("taxi-claim-denied");
            return true;
          }
          yield runJoinedAction("Claiming taxi fare", () => joinClient2.claimTaxiContract(message.contractId), {
            success: "Taxi fare claim sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.taxi.complete") {
          yield runJoinedAction("Completing taxi fare", () => joinClient2.completeTaxiContract(message.contractId), {
            success: "Taxi fare completion sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.wanted.refresh") {
          yield runJoinedAction("Refreshing wanted board", () => joinClient2.requestWantedBoard({
            status: message.status || "active",
            hold: message.hold || "Whiterun"
          }), {
            success: "Wanted board refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.jail.tasks.refresh") {
          yield runJoinedAction("Refreshing jail labor", () => joinClient2.requestJailTasks({
            status: message.status || "assigned",
            sentenceId: message.sentenceId
          }), {
            success: "Jail labor refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.jail.task.complete") {
          yield runJoinedAction("Completing jail labor", () => joinClient2.completeJailTask(message.taskId, {
            notes: label(message.text || message.notes, "") || "Completed from the in-game jail marker."
          }), {
            success: "Jail labor completion sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.crime.report") {
          yield runJoinedAction("Reporting incident", () => joinClient2.reportCrime({
            crimeType: message.crimeType || "disturbance",
            severity: message.severity || "minor",
            hold: message.hold || "Whiterun",
            description: label(message.text || message.description, "") || "Filed from the in-game guard post."
          }), {
            success: "Incident report sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.medical.refresh") {
          yield runJoinedAction("Refreshing medical calls", () => joinClient2.requestMedicalCalls({
            status: message.status || "downed"
          }), {
            success: "Medical calls refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.injury.treat") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const gate = healerGate(owner, state.phase === "joined");
          if (!gate.enabled) {
            setLastAction(`Treatment unavailable: ${gate.reasons.join(", ")}.`);
            sendUpdate("injury-treat-denied");
            return true;
          }
          yield runJoinedAction("Treating injury", () => joinClient2.treatInjury(message.injuryId, {
            notes: label(message.text || message.notes, "") || "Treated from the in-game medical context."
          }), {
            success: "Treatment sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.business.orders.refresh") {
          yield runJoinedAction("Refreshing business orders", () => joinClient2.requestBusinessOrders({
            status: message.status || "active",
            businessId: message.businessId || null
          }), {
            success: "Business orders refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.business.order.fulfill") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const order = openBusinessOrders(owner, state).find((candidate) => label(candidate == null ? void 0 : candidate.id, "") === label(message.orderId, ""));
          if (!order) {
            setLastAction("Business order unavailable.");
            sendUpdate("business-order-denied");
            return true;
          }
          const profession = businessOrderProfessionCode(order);
          if (profession && !activeProfessionCodes(owner).has(profession)) {
            setLastAction(`Business order unavailable: choose ${humanizedCode(profession, "Profession")} in K.`);
            sendUpdate("business-order-denied");
            return true;
          }
          const orderGate = businessOrderOpportunityDetail(order, owner, state.phase === "joined");
          if (!orderGate.ready) {
            setLastAction("Business order unavailable: carry the requested goods first.");
            sendUpdate("business-order-denied");
            return true;
          }
          yield runJoinedAction("Fulfilling business order", () => joinClient2.fulfillBusinessOrder(
            message.orderId,
            Number(message.quantity || 1)
          ), {
            success: "Business order fulfillment sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.business.listings.refresh") {
          yield runJoinedAction("Refreshing shop listings", () => joinClient2.requestBusinessListings({
            status: message.status || "active",
            businessId: message.businessId || null
          }), {
            success: "Shop listings refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.business.listing.buy") {
          yield runJoinedAction("Buying shop listing", () => joinClient2.buyBusinessListing(
            message.listingId,
            Number(message.quantity || 1)
          ), {
            success: "Shop purchase sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.craft.recipe") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const recipe = knownRecipes(owner, state).find((candidate) => recipeCode(candidate) === label(message.recipeCode, ""));
          if (recipe) {
            const gate = recipeCraftGate(recipe, owner, state.phase === "joined", Number(message.quantity || 1));
            if (!gate.enabled) {
              setLastAction(`Craft unavailable: ${gate.reasons.join(", ")}.`);
              sendUpdate("craft-denied");
              return true;
            }
          }
          yield runJoinedAction("Crafting recipe", () => joinClient2.craftRecipe(
            message.recipeCode,
            Number(message.quantity || 1)
          ), {
            success: "Craft request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.spell.tome.learn") {
          const itemCode = label(message.itemCode, "").toLowerCase();
          if (!itemCode) {
            setLastAction("Spell tome unavailable.");
            sendUpdate("spell-tome-denied");
            return true;
          }
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const inventoryItem = inventoryItemForCode(owner, itemCode);
          if (!inventoryItem && inventoryKnown(owner)) {
            setLastAction("Spell tome unavailable.");
            sendUpdate("spell-tome-denied");
            return true;
          }
          yield runJoinedAction("Studying spell tome", () => joinClient2.learnSpellTome(itemCode), {
            success: "Spell tome studied.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.professions.refresh") {
          yield runJoinedAction("Refreshing professions", () => joinClient2.requestProfessionMemberships(), {
            success: "Professions refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.profession.join") {
          const owner = getRpOverview() || joinClient2.getState().ownerSnapshot || {};
          const selectedCode = label(message.professionCode, "").toLowerCase();
          const profession = publicProfessions(owner, { allowCatalogFallback: true }).find((entry) => professionCode(entry) === selectedCode);
          const existingPrimary = primaryProfession(owner);
          const alreadyActive = activeProfessionCodes(owner).has(selectedCode);
          const invitation = activeProfessionInvitationForCode(owner, selectedCode);
          if (!profession) {
            setLastAction("Profession unavailable.");
            sendUpdate("profession-join-denied");
            return true;
          }
          if (existingPrimary && !alreadyActive && !invitation) {
            setLastAction("First profession is already locked.");
            sendUpdate("profession-join-denied");
            return true;
          }
          const professionName = label(profession.displayName, "Profession");
          const actionLabel = invitation && !alreadyActive ? `Accepting ${professionName}` : `Choosing ${professionName}`;
          yield runCharacterHttpAction(actionLabel, ({ auth, characterId }) => {
            if (invitation && !alreadyActive) {
              return http2.post(
                `/professions/${encodeURIComponent(characterId)}/invitations/${encodeURIComponent(invitation.id)}/accept`,
                {},
                { auth }
              );
            }
            return http2.post(
              `/professions/${encodeURIComponent(characterId)}/memberships`,
              { professionCode: selectedCode },
              { auth }
            );
          }, {
            success: invitation && !alreadyActive ? `${professionName} invitation accepted.` : `${professionName} chosen.`,
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guild.due.pay") {
          yield runJoinedAction("Paying guild due", () => joinClient2.payGuildDue(message.dueId), {
            success: "Guild due payment sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guild.contract.claim") {
          yield runJoinedAction("Claiming guild contract", () => joinClient2.claimGuildContract(message.contractId), {
            success: "Guild contract claim sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guild.contract.complete") {
          yield runJoinedAction("Completing guild contract", () => joinClient2.completeGuildContract(message.claimId), {
            success: "Guild contract completion sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guild.member.upsert") {
          yield runJoinedAction("Updating guild member", () => joinClient2.upsertGuildMember({
            guildId: message.guildId,
            targetCharacterId: message.targetCharacterId,
            rankCode: message.rankCode || "recruit",
            title: message.title || null,
            permissions: message.permissions || null,
            notes: message.notes || ""
          }), {
            success: "Guild member update sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guild.member.revoke") {
          yield runJoinedAction("Removing guild member", () => joinClient2.revokeGuildMember({
            guildId: message.guildId,
            targetCharacterId: message.targetCharacterId,
            reason: message.reason || ""
          }), {
            success: "Guild member removal sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.resources.refresh") {
          yield runJoinedAction("Refreshing resource nodes", () => joinClient2.requestResourceNodes(), {
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.resource.gather") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const resource = firstResourceForAnchor(owner, state, message.nodeCode);
          if (resource == null ? void 0 : resource.code) {
            const gate = resourceGatherGate(resource, owner, state.phase === "joined");
            if (!gate.enabled) {
              setLastAction(`Gather unavailable: ${gate.reasons.join(", ") || "resource unavailable"}.`);
              sendUpdate("resource-gather-denied");
              return true;
            }
          }
          yield runJoinedAction("Gathering resource", () => joinClient2.gatherResourceNode(message.nodeCode), {
            success: "Gather request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.dungeon.start") {
          const state = joinClient2.getState();
          const owner = getRpOverview() || state.ownerSnapshot || {};
          const encounter = dungeonEncounterList(owner, state).find((candidate) => dungeonEncounterCode(candidate) === label(message.encounterCode, "").toLowerCase());
          if (encounter) {
            const gate = dungeonEncounterGate(encounter, state.phase === "joined");
            if (!gate.enabled) {
              setLastAction(`Encounter unavailable: ${gate.reasons.join(", ") || "encounter unavailable"}.`);
              sendUpdate("dungeon-start-denied");
              return true;
            }
          }
          yield runJoinedAction("Starting encounter", () => joinClient2.startDungeonEncounter(message.encounterCode), {
            success: "Encounter start sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.properties.refresh") {
          yield runJoinedAction("Refreshing properties", () => joinClient2.requestProperties(), {
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.charges.refresh") {
          yield runJoinedAction("Refreshing property charges", () => joinClient2.requestPropertyCharges({
            propertyId: message.propertyId || null,
            status: message.status || "open",
            chargeType: message.chargeType || null
          }), {
            success: "Property charges refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.charge.pay") {
          yield runJoinedAction("Paying property charge", () => joinClient2.payPropertyCharge(message.chargeId), {
            success: "Property charge payment sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.upgrades.refresh") {
          yield runJoinedAction("Refreshing property building upgrades", () => joinClient2.requestPropertyUpgrades({
            propertyId: message.propertyId,
            status: message.status || "active"
          }), {
            success: "Building upgrades refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.upgrade.install") {
          yield runJoinedAction("Installing property building upgrade", () => joinClient2.installPropertyUpgrade({
            propertyId: message.propertyId,
            upgradeCode: message.upgradeCode,
            displayName: message.displayName || message.upgradeCode,
            category: message.category || "general",
            level: message.level || 1,
            cost: message.cost || 0,
            notes: message.notes || "Installed from in-game organization panel"
          }), {
            success: "Building upgrade install sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.upgrade.retire") {
          yield runJoinedAction("Retiring property building upgrade", () => joinClient2.retirePropertyUpgrade({
            propertyId: message.propertyId,
            upgradeId: message.upgradeId,
            reason: message.reason || "Retired from in-game organization panel"
          }), {
            success: "Building upgrade retire sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.rent") {
          yield runJoinedAction("Renting property", () => joinClient2.rentProperty(message.propertyId), {
            success: "Rent request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.purchase") {
          yield runJoinedAction("Buying property deed", () => joinClient2.purchaseProperty(message.propertyId), {
            success: "Purchase request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.saleListings.refresh") {
          yield runJoinedAction("Refreshing property sales", () => joinClient2.requestPropertySaleListings({
            propertyId: message.propertyId || null,
            status: message.status || "active"
          }), {
            success: "Property sales refreshed.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.saleListing.create") {
          const askingPrice = Number((_c = (_b = message.askingPrice) != null ? _b : message.text) != null ? _c : "");
          if (!Number.isInteger(askingPrice) || askingPrice < 1 || askingPrice > 1e8) {
            setLastAction("Enter a sale price from 1 to 100000000 gold.");
            sendUpdate("property-sale-listing-create-invalid");
            return true;
          }
          yield runJoinedAction("Creating property sale listing", () => joinClient2.createPropertySaleListing({
            propertyId: message.propertyId,
            askingPrice,
            buyerCharacterId: message.buyerCharacterId || null,
            expiresAt: message.expiresAt || null
          }), {
            success: "Property sale listing created.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.saleListing.buy") {
          yield runJoinedAction("Buying property sale listing", () => joinClient2.buyPropertySaleListing(message.listingId), {
            success: "Property deed purchase sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.saleListing.cancel") {
          yield runJoinedAction("Cancelling property sale listing", () => joinClient2.cancelPropertySaleListing(message.listingId), {
            success: "Property sale cancelled.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.access") {
          yield runJoinedAction("Checking property access", () => joinClient2.checkPropertyAccess(message.propertyId, message.requiredRoles || []), {
            success: "Property access checked.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.interact") {
          yield runJoinedAction("Using property object", () => joinClient2.interactProperty({
            propertyId: message.propertyId,
            interaction: message.interaction,
            target: message.target || "",
            requiredRoles: message.requiredRoles || []
          }), {
            success: "Property interaction sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.access.grant") {
          yield runJoinedAction("Granting property access", () => joinClient2.grantPropertyAccess({
            propertyId: message.propertyId,
            targetCharacterId: message.targetCharacterId,
            role: message.role
          }), {
            success: "Property access granted.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.access.revoke") {
          yield runJoinedAction("Revoking property access", () => joinClient2.revokePropertyAccess({
            propertyId: message.propertyId,
            targetCharacterId: message.targetCharacterId,
            role: message.role
          }), {
            success: "Property access revoked.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.storage.refresh") {
          yield runJoinedAction("Refreshing property storage", () => joinClient2.requestPropertyStorage(message.propertyId), {
            success: "Property storage requested.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.storage.deposit") {
          yield runJoinedAction("Depositing property storage", () => joinClient2.depositPropertyStorage({
            propertyId: message.propertyId,
            itemCode: message.itemCode,
            quantity: Number(message.quantity || 1)
          }), {
            success: "Storage deposit sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.storage.withdraw") {
          yield runJoinedAction("Withdrawing property storage", () => joinClient2.withdrawPropertyStorage({
            propertyId: message.propertyId,
            itemCode: message.itemCode,
            quantity: Number(message.quantity || 1)
          }), {
            success: "Storage withdraw sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.storageAuction.refresh") {
          yield runJoinedAction("Refreshing storage auctions", () => joinClient2.requestStorageAuctionLots({
            status: message.status || "open",
            eventId: message.eventId || null
          }), {
            success: "Storage auctions requested.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.storageAuction.events.refresh") {
          yield runJoinedAction("Refreshing storage auction events", () => joinClient2.requestStorageAuctionEvents({
            status: message.status || "active",
            includeLots: message.includeLots === true
          }), {
            success: "Storage auction events requested.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.storageAuction.bid") {
          yield runJoinedAction("Bidding on storage auction", () => joinClient2.bidStorageAuctionLot(message.lotId, Number(message.amount || 1)), {
            success: "Storage auction bid sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.locks.refresh") {
          yield runJoinedAction("Refreshing property locks", () => joinClient2.requestPropertyLocks(message.propertyId), {
            success: "Property locks requested.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.lock.change") {
          yield runJoinedAction("Changing property lock", () => {
            var _a2;
            return joinClient2.changePropertyLock({
              propertyId: message.propertyId,
              targetCode: message.targetCode,
              lockLevel: (_a2 = message.lockLevel) != null ? _a2 : null,
              reason: message.reason || "Changed lock from in-game property context"
            });
          }, {
            success: "Lock change sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.key.issue") {
          yield runJoinedAction("Issuing property key", () => joinClient2.issuePropertyKey({
            propertyId: message.propertyId,
            targetCode: message.targetCode,
            targetCharacterId: message.targetCharacterId,
            label: message.label || null
          }), {
            success: "Property key issued.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.property.key.revoke") {
          yield runJoinedAction("Revoking property key", () => joinClient2.revokePropertyKey({
            propertyId: message.propertyId,
            keyId: message.keyId
          }), {
            success: "Property key revoked.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.injury.report") {
          yield runJoinedAction("Calling healer", () => joinClient2.reportInjury({
            injuryType: "field_injury",
            severity: "serious",
            description: label(message.text || message.description, "") || "Player requested healer support from the RP menu."
          }), {
            success: "Healer call sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.peer.introduce") {
          yield runJoinedAction("Introducing yourself", () => joinClient2.introduceToPeer(message.clientId), {
            success: "Introduction sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.peer.inspect") {
          yield runJoinedAction("Inspecting character", () => joinClient2.inspectPeer(message.clientId), {
            success: "Inspection requested."
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.peer.trade") {
          yield runJoinedAction("Requesting trade", () => joinClient2.requestTradeWithPeer(message.clientId), {
            success: "Trade request sent."
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.trade.offer.create") {
          const price = Number((_e = (_d = message.price) != null ? _d : message.text) != null ? _e : 0);
          if (!Number.isInteger(price) || price < 0 || price > 1e6) {
            setLastAction("Enter a trade price from 0 to 1000000 gold.");
            sendUpdate("trade-offer-create-invalid");
            return true;
          }
          yield runJoinedAction("Creating trade offer", () => joinClient2.createTradeOffer({
            buyerCharacterId: message.buyerCharacterId,
            price,
            ttlSeconds: Number(message.ttlSeconds || 300),
            items: [{
              itemCode: message.itemCode,
              quantity: Number(message.quantity || 1)
            }]
          }), {
            success: "Trade offer sent."
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.trade.offer.accept") {
          yield runJoinedAction("Accepting trade offer", () => joinClient2.acceptTradeOffer(message.offerId), {
            success: "Trade offer accepted.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guard.search") {
          yield runJoinedAction("Searching character", () => joinClient2.searchCharacter(message.characterId), {
            success: "Search recorded.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guard.cuff") {
          yield runJoinedAction("Cuffing character", () => joinClient2.cuffCharacter(message.characterId), {
            success: "Cuff request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.guard.arrest") {
          yield runJoinedAction("Arresting character", () => joinClient2.arrestCharacter(message.characterId), {
            success: "Arrest request sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.crime.pickpocket") {
          yield runJoinedAction("Attempting pickpocket", () => joinClient2.pickpocketCharacter(message.characterId), {
            success: "Pickpocket attempt sent.",
            refreshOverview: true
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.comms.submit") {
          const parsed = parseCommsSubmit({
            mode: message.mode,
            text: message.text
          });
          if (!parsed) {
            setLastAction("Message is empty.");
            sendUpdate("comms-empty");
            return true;
          }
          if (parsed.type === "local") {
            return handleBrowserMessage({ arguments: [{ type: "rp.chat.local", text: parsed.text }] });
          }
          if (parsed.type === "roll") {
            return handleBrowserMessage({ arguments: [{ type: "rp.roll", expression: parsed.expression }] });
          }
          return handleBrowserMessage({ arguments: [{ type: "rp.expression", kind: parsed.kind, text: parsed.text }] });
        }
        if ((message == null ? void 0 : message.type) === "rp.chat.local") {
          yield runJoinedAction("Sending local chat", () => joinClient2.sendChat("local", message.text), {
            success: "Local chat sent."
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.expression") {
          yield runJoinedAction("Sending RP expression", () => joinClient2.sendRpExpression(message.kind || "me", {
            text: message.text
          }), {
            success: "RP expression sent."
          });
          return true;
        }
        if ((message == null ? void 0 : message.type) === "rp.roll") {
          yield runJoinedAction("Rolling dice", () => joinClient2.rollDice(message.expression || "1d20"), {
            success: "Roll requested."
          });
          return true;
        }
        return false;
      });
    }
    function runJoinedAction(_0, _1) {
      return __async(this, arguments, function* (label2, action, { success = `${label2} sent.`, refreshOverview = false } = {}) {
        const state = joinClient2.getState();
        if (state.phase !== "joined") {
          setLastAction(`${label2} is available after joining.`);
          sendUpdate("rp-action-denied");
          return false;
        }
        try {
          setLastAction(`${label2}...`);
          const accepted = yield action();
          if (!accepted) {
            setLastAction(`${label2} was not accepted.`);
            sendUpdate("rp-action-not-accepted");
            return false;
          }
          if (refreshOverview) {
            yield refreshRpOverview("menu_action");
          }
          setLastAction(success);
          sendUpdate("rp-action");
          return true;
        } catch (error) {
          const message = (error == null ? void 0 : error.message) || String(error);
          logger(`${label2} failed: ${message}`);
          setLastAction(`${label2} failed: ${message}`);
          sendUpdate("rp-action-failed");
          return false;
        }
      });
    }
    function runCharacterHttpAction(_0, _1) {
      return __async(this, arguments, function* (label2, action, { success = `${label2} sent.`, refreshOverview = false } = {}) {
        const state = joinClient2.getState();
        const owner = getRpOverview() || state.ownerSnapshot || {};
        const characterId = activeCharacterIdForState(state, owner);
        const auth = activeAuthForState(state, storage2, settings2);
        if (!auth || !characterId) {
          setLastAction(`${label2} is available after your character is selected.`);
          sendUpdate("rp-character-action-denied");
          return false;
        }
        try {
          setLastAction(`${label2}...`);
          const result = yield action({
            auth,
            characterId,
            owner,
            state
          });
          if (refreshOverview) {
            yield refreshRpOverview("menu_action");
          }
          setLastAction(success);
          sendUpdate("rp-character-action");
          return result !== false;
        } catch (error) {
          const message = (error == null ? void 0 : error.message) || String(error);
          logger(`${label2} failed: ${message}`);
          setLastAction(`${label2} failed: ${message}`);
          sendUpdate("rp-character-action-failed");
          return false;
        }
      });
    }
    function handleWorldActivation(anchorCode, source = "native_activate") {
      return __async(this, null, function* () {
        const cleanAnchorCode = label(anchorCode, "");
        if (!cleanAnchorCode) {
          setLastAction("Unknown RP object.");
          sendUpdate("world-activation-missing");
          return false;
        }
        const state = joinClient2.getState();
        const owner = getRpOverview() || state.ownerSnapshot || {};
        const resource = firstResourceForAnchor(owner, state, cleanAnchorCode);
        const propertyInteraction = propertyInteractionForAnchor(cleanAnchorCode);
        const canAct = state.phase === "joined";
        const worldContext = createActivatedAnchorContextPayload({
          owner,
          state,
          canAct,
          anchorCode: cleanAnchorCode
        });
        reportStatus("world_activation", { anchorCode: cleanAnchorCode, source });
        if (worldContext.target) {
          const boardCode = label(worldContext.target.id || cleanAnchorCode, cleanAnchorCode);
          activatedWorldAnchorCode = cleanAnchorCode;
          interactionHeld = false;
          skillsOpen = false;
          organizationsOpen = false;
          menuFocused = true;
          safeBrowser(() => {
            browser2.setVisible(true);
            browser2.setFocused(true);
            visible = true;
            markDirty();
            reportStatus("world_context_show", { anchorCode: cleanAnchorCode, source });
          }, "world-context");
          setLastAction(`Opened ${label(worldContext.target.label, "RP object")}.`);
          sendUpdate("world-activation-context");
          if (worldContext.target.type === "notice_board") {
            const noticesAccepted = joinClient2.requestNoticeBoardPosts(boardCode);
            reportStatus("world_board_read", {
              anchorCode: cleanAnchorCode,
              boardCode,
              source,
              noticesAccepted
            });
          }
          if (worldContext.target.type === "courier") {
            const courierAccepted = joinClient2.requestCourierDeliveries({ status: "open" });
            reportStatus("world_courier_read", {
              anchorCode: cleanAnchorCode,
              source,
              courierAccepted
            });
          }
          if (worldContext.target.type === "taxi") {
            Promise.resolve(joinClient2.requestTaxiRoutes({ status: "active" })).catch((error) => {
              logger(`taxi route refresh failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            });
            Promise.resolve(joinClient2.requestTaxiContracts({ status: "open" })).catch((error) => {
              logger(`taxi contract refresh failed: ${(error == null ? void 0 : error.message) || String(error)}`);
            });
            reportStatus("world_taxi_read", {
              anchorCode: cleanAnchorCode,
              source
            });
          }
          if (worldContext.target.type === "commerce") {
            const ordersAccepted = joinClient2.requestBusinessOrders({ status: "active" });
            const listingsAccepted = joinClient2.requestBusinessListings({ status: "active" });
            reportStatus("world_commerce_read", {
              anchorCode: cleanAnchorCode,
              source,
              ordersAccepted,
              listingsAccepted
            });
          }
          if (worldContext.target.type === "law") {
            const wantedAccepted = joinClient2.requestWantedBoard({ status: "active", hold: "Whiterun" });
            const jailTasksAccepted = cleanAnchorCode === "riverwood_jail_marker" ? joinClient2.requestJailTasks({ status: "assigned" }) : false;
            reportStatus("world_law_read", {
              anchorCode: cleanAnchorCode,
              source,
              wantedAccepted,
              jailTasksAccepted
            });
          }
          if (worldContext.target.type === "medical") {
            const medicalAccepted = joinClient2.requestMedicalCalls({ status: "downed" });
            reportStatus("world_medical_read", {
              anchorCode: cleanAnchorCode,
              source,
              medicalAccepted
            });
          }
          return true;
        }
        if (resource == null ? void 0 : resource.code) {
          show(false);
          return runJoinedAction(`Gathering ${resourceDisplayName(resource)}`, () => joinClient2.gatherResourceNode(resource.code), {
            success: `${resourceDisplayName(resource)} gather sent.`,
            refreshOverview: true
          });
        }
        if (propertyInteraction) {
          show(false);
          return runJoinedAction(propertyInteraction.actionLabel, () => joinClient2.interactProperty(propertyInteraction.message), {
            success: propertyInteraction.success,
            refreshOverview: true
          });
        }
        setLastAction(`${cleanAnchorCode} is not wired yet.`);
        sendUpdate("world-activation-unhandled");
        return false;
      });
    }
    function tick(reason = "tick") {
      const inWorld = inWorldOverlayActive();
      const state = joinClient2.getState();
      const world = getWorldState() || {};
      if (world.worldLoaded === true) {
        pendingPlayWorldStart = false;
        playJoinStarted = false;
      }
      if (pendingPlayWorldStart && state.phase === "joined" && world.worldLoaded !== true) {
        return startWorldFromMainMenu("start-world");
      }
      if (!inWorld) {
        autoHiddenForWorld = false;
        interactionHeld = false;
        activatedWorldAnchorCode = null;
        skillsOpen = false;
        organizationsOpen = false;
        commsOpen = false;
        commsPreviewUntil = 0;
        localSpeaking = false;
      }
      if (inWorld && visible && !menuFocused && !interactionHeld && !activatedWorldAnchorCode && !localSpeaking && !organizationsOpen && !commsOpen && commsPreviewUntil <= now() && !autoHiddenForWorld) {
        autoHiddenForWorld = true;
        hide();
        return false;
      }
      if (inWorld && visible) {
        safeBrowser(() => {
          browser2.setFocused(menuFocused);
        }, "hud-focus");
      } else if (!inWorld && menuFocused) {
        menuFocused = false;
      }
      if (visible && (dirty || now() - lastUpdateAt > 1e3)) {
        sendUpdate(dirty ? "state" : reason);
        return true;
      }
      return false;
    }
    function getState() {
      return {
        visible,
        dirty,
        lastUpdateAt
      };
    }
    return {
      markDirty,
      setLastAction,
      notifyChatEvent,
      payload,
      sendUpdate,
      show,
      hide,
      refreshServerStatus,
      handleBrowserMessage,
      handleWorldActivation,
      setMenuFocus,
      setInteractionHeld,
      setSkillsOpen,
      toggleSkillsPanel,
      setOrganizationsOpen,
      toggleOrganizationsPanel,
      toggleGuildsPanel,
      setCommsOpen,
      toggleCommsPanel,
      setLocalSpeaking,
      toggleMenuFocus,
      toggleVisibility,
      tick,
      getState
    };
  }

  // src/wallet-sync-service.js
  var defaultGoldFormId = 15;
  function finiteInterval2(value, fallback = 3e3) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(1e3, parsed) : fallback;
  }
  function errorMessage2(error) {
    return (error == null ? void 0 : error.message) || String(error);
  }
  function resolveGoldForm(Game2, goldFormId) {
    let getFormError = null;
    if (typeof Game2.getForm === "function") {
      try {
        const gold2 = Game2.getForm(goldFormId);
        if (gold2) {
          return gold2;
        }
      } catch (error) {
        getFormError = error;
      }
    }
    const gold = Game2.getFormEx(goldFormId);
    if (gold) {
      return gold;
    }
    if (getFormError) {
      throw getFormError;
    }
    return null;
  }
  function resolveGoldContext(Game2, goldFormId) {
    const player = Game2.getPlayer();
    const gold = resolveGoldForm(Game2, goldFormId);
    if (!player || !gold) {
      return null;
    }
    return { player, gold };
  }
  function normalizedGoldCount(value) {
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }
    return Math.trunc(value);
  }
  function createSkyrimGoldReader({ Game: Game2, goldFormId = defaultGoldFormId }) {
    if (!Game2 || typeof Game2.getPlayer !== "function" || typeof Game2.getFormEx !== "function") {
      throw new Error("SkyrimPlatform Game API is required for wallet gold reads");
    }
    return function readSkyrimGold() {
      const context = resolveGoldContext(Game2, goldFormId);
      if (!context) {
        return null;
      }
      return normalizedGoldCount(context.player.getItemCount(context.gold));
    };
  }
  function createSkyrimGoldReconciler({ Game: Game2, goldFormId = defaultGoldFormId }) {
    if (!Game2 || typeof Game2.getPlayer !== "function" || typeof Game2.getFormEx !== "function") {
      throw new Error("SkyrimPlatform Game API is required for wallet gold writes");
    }
    return function reconcileSkyrimGold2(targetGold) {
      if (!Number.isInteger(targetGold) || targetGold < 0 || targetGold > 2147483647) {
        throw new Error("targetGold must be an integer from 0 to 2147483647");
      }
      const context = resolveGoldContext(Game2, goldFormId);
      if (!context) {
        return {
          applied: false,
          before: null,
          after: null,
          delta: 0,
          targetGold,
          reason: "missing_player_or_gold_form"
        };
      }
      const before = normalizedGoldCount(context.player.getItemCount(context.gold));
      if (before === null) {
        return {
          applied: false,
          before: null,
          after: null,
          delta: 0,
          targetGold,
          reason: "invalid_current_gold"
        };
      }
      const delta = targetGold - before;
      if (delta === 0) {
        return {
          applied: false,
          before,
          after: before,
          delta,
          targetGold,
          reason: "already_matched"
        };
      }
      if (delta > 0) {
        if (typeof context.player.addItem !== "function") {
          throw new Error("SkyrimPlatform player.addItem is required for wallet gold writes");
        }
        context.player.addItem(context.gold, delta, true);
      } else {
        if (typeof context.player.removeItem !== "function") {
          throw new Error("SkyrimPlatform player.removeItem is required for wallet gold writes");
        }
        context.player.removeItem(context.gold, Math.abs(delta), true, null);
      }
      const after = normalizedGoldCount(context.player.getItemCount(context.gold));
      return {
        applied: true,
        before,
        after,
        delta,
        targetGold
      };
    };
  }
  function createWalletSyncService(options = {}) {
    const {
      enabled = true,
      intervalMs = 3e3,
      readGold = () => null,
      isReady = () => false,
      syncWalletGold = (_gold, _options = {}) => false,
      logger = (_message) => {
      },
      reportDiagnostic = (_0, ..._1) => __async(null, [_0, ..._1], function* (_eventType, _details = {}) {
      }),
      isContextError = (_error) => false,
      source = "skyrim_gold",
      reason = "Skyrim gold sync",
      now = () => Date.now()
    } = options;
    const state = {
      enabled: Boolean(enabled),
      intervalMs: finiteInterval2(intervalMs),
      lastAttemptAt: 0,
      lastSyncedGold: null,
      contextWarningSent: false,
      readWarningSent: false,
      lastError: null,
      lastSyncedAt: null
    };
    function report(eventType, details = {}) {
      Promise.resolve(reportDiagnostic(eventType, details)).catch((error) => {
        logger(`diagnostic failed: ${errorMessage2(error)}`);
      });
    }
    function handleReadError(error) {
      state.lastError = errorMessage2(error);
      if (!state.contextWarningSent && isContextError(error)) {
        state.contextWarningSent = true;
        logger("wallet sync waiting for playable world before reading Skyrim gold");
        report("wallet_sync_waiting", {
          error: state.lastError,
          source
        });
        return false;
      }
      if (!state.readWarningSent) {
        state.readWarningSent = true;
        logger(`wallet sync gold read failed: ${state.lastError}`);
      }
      return false;
    }
    function tick(currentTime = now()) {
      if (!state.enabled || currentTime - state.lastAttemptAt < state.intervalMs) {
        return false;
      }
      if (!isReady()) {
        return false;
      }
      state.lastAttemptAt = currentTime;
      let gold;
      try {
        gold = readGold();
      } catch (error) {
        return handleReadError(error);
      }
      if (gold === null || gold === void 0 || gold === state.lastSyncedGold) {
        return false;
      }
      if (!Number.isInteger(gold) || gold < 0 || gold > 2147483647) {
        state.lastError = "gold must be an integer from 0 to 2147483647";
        if (!state.readWarningSent) {
          state.readWarningSent = true;
          logger(`wallet sync gold read failed: ${state.lastError}`);
        }
        return false;
      }
      const sent = syncWalletGold(gold, { source, reason });
      if (!sent) {
        return false;
      }
      state.lastSyncedGold = gold;
      state.lastSyncedAt = currentTime;
      state.contextWarningSent = false;
      state.readWarningSent = false;
      state.lastError = null;
      logger(`wallet sync gold=${gold}`);
      return true;
    }
    return {
      state,
      tick,
      getState() {
        return __spreadValues({}, state);
      }
    };
  }

  // src/skyrim-platform-entry.ts
  function settingEnabled(value, defaultValue = true) {
    if (value === void 0 || value === null || value === "") {
      return defaultValue;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["false", "0", "no", "off"].includes(normalized)) {
        return false;
      }
      if (["true", "1", "yes", "on"].includes(normalized)) {
        return true;
      }
    }
    return Boolean(value);
  }
  function settingText(value, fallback = "") {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
  }
  function validateConsoleCell(value) {
    const cell = value.trim();
    if (!/^[A-Za-z0-9_]+$/.test(cell)) {
      throw new Error(`Stage 1 test cell '${value}' must be a vanilla console cell EditorID`);
    }
    return cell;
  }
  function parseFormIdSetting(value, fallback) {
    if (value === void 0 || value === null || value === "") {
      return fallback;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      const parsed = trimmed.toLowerCase().startsWith("0x") ? Number.parseInt(trimmed.slice(2), 16) : Number.parseInt(trimmed, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    throw new Error(`Stage 1 world/cell form ID '${String(value)}' is invalid`);
  }
  function parseVectorSetting(value, fallback) {
    if (Array.isArray(value)) {
      const parsed = value.map((part) => Number(part));
      if (parsed.length === 3 && parsed.every(Number.isFinite)) {
        return parsed;
      }
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = value.split(/[,\s]+/).filter(Boolean).map((part) => Number(part));
      if (parsed.length === 3 && parsed.every(Number.isFinite)) {
        return parsed;
      }
    }
    return [...fallback];
  }
  function formatFormId(value) {
    return `0x${Math.trunc(value).toString(16)}`;
  }
  function objectKeys(value) {
    if (!value || typeof value !== "object") {
      return [];
    }
    return Object.keys(value);
  }
  function splitKeySetting(value) {
    return value.split(/[,\s;]+/).map((entry) => entry.trim()).filter(Boolean);
  }
  function uniqueKeys(keys) {
    const seen = /* @__PURE__ */ new Set();
    const result = [];
    for (const key of keys) {
      const normalized = key.toLowerCase();
      if (seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      result.push(key);
    }
    return result;
  }
  function normalizedKeyName(key) {
    return String(key || "").trim().toUpperCase();
  }
  function isUnboundKeyName(key) {
    const normalized = normalizedKeyName(key);
    return !normalized || ["UNBOUND", "NONE", "DISABLED", "OFF"].includes(normalized);
  }
  function isDisabledVanillaControlKeyName(key) {
    const normalized = normalizedKeyName(key);
    return Boolean(normalized && disabledVanillaControlKeys().some((disabledKey) => normalizedKeyName(disabledKey) === normalized));
  }
  function rpMenuKeySetting(value, fallback) {
    const key = settingText(value, fallback);
    return isDisabledVanillaControlKeyName(key) ? fallback : key;
  }
  function rpMenuKeyList(keys) {
    return uniqueKeys(keys).filter((key) => !isUnboundKeyName(key) && !isDisabledVanillaControlKeyName(key));
  }
  function normalizeStringMap(value) {
    if (!value) {
      return {};
    }
    if (typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [String(key), String(entry || "").trim()]).filter(([_key, entry]) => entry !== ""));
    }
    if (typeof value !== "string") {
      return {};
    }
    try {
      return normalizeStringMap(JSON.parse(value));
    } catch (e) {
      const map = {};
      for (const entry of value.split(/[;\n]/)) {
        const [key, mapped] = entry.split("=").map((part) => part == null ? void 0 : part.trim());
        if (key && mapped) {
          map[key] = mapped;
        }
      }
      return map;
    }
  }
  function normalizeFormId(value) {
    if (value === void 0 || value === null || value === "") {
      return "";
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.trunc(value).toString(16).padStart(8, "0").toLowerCase();
    }
    if (typeof value !== "string") {
      return "";
    }
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      return "";
    }
    const withoutPrefix = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;
    if (/^[0-9a-f]+$/.test(withoutPrefix)) {
      return withoutPrefix.padStart(8, "0").slice(-8).toLowerCase();
    }
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? Math.trunc(parsed).toString(16).padStart(8, "0").toLowerCase() : "";
  }
  function normalizeActivationMapKey(value) {
    const clean = String(value || "").trim().toLowerCase();
    if (!clean) {
      return "";
    }
    const localPrefixed = clean.match(/^(ref-local|base-local|local):(.+)$/);
    if (localPrefixed) {
      const formId = normalizeFormId(localPrefixed[2]);
      return formId ? `${localPrefixed[1]}:${formId.slice(2)}` : "";
    }
    const prefixed = clean.match(/^(ref|base|form):(.+)$/);
    if (prefixed) {
      const formId = normalizeFormId(prefixed[2]);
      return formId ? `${prefixed[1]}:${formId}` : "";
    }
    return normalizeFormId(clean);
  }
  function normalizeActivationMap(value) {
    const raw = normalizeStringMap(value);
    const map = {};
    for (const [key, anchorCode] of Object.entries(raw)) {
      const normalized = normalizeActivationMapKey(key);
      const cleanAnchorCode = settingText(anchorCode);
      if (normalized && cleanAnchorCode) {
        map[normalized] = cleanAnchorCode;
        const prefixed = normalized.match(/^(ref|base|form):([0-9a-f]{8})$/);
        if (prefixed) {
          map[`${prefixed[1]}-local:${prefixed[2].slice(2)}`] = cleanAnchorCode;
        } else if (/^[0-9a-f]{8}$/.test(normalized)) {
          map[`local:${normalized.slice(2)}`] = cleanAnchorCode;
        }
      }
    }
    return map;
  }
  function resolvePluginSettings(allSettings) {
    return allSettings["skyrim-rp-client"] || allSettings["skyrim-rp"] || {};
  }
  var pluginSettings = resolvePluginSettings(settings);
  var storedAuth = storage["skyrimRpAuth"] || {};
  var backendUrl = pluginSettings.backendUrl || "http://localhost:3117";
  var pushToTalkKey = pluginSettings.pushToTalk || "V";
  var disabledVanillaControls = settingText(pluginSettings.disabledVanillaControls, "T");
  var hardDisabledVanillaControls = ["T"];
  var blockVanillaWait = settingEnabled(pluginSettings.blockVanillaWait, true);
  var configuredVanillaWaitAssertIntervalMs = Number(pluginSettings.vanillaWaitAssertIntervalMs || 500);
  var vanillaWaitAssertIntervalMs = Number.isFinite(configuredVanillaWaitAssertIntervalMs) ? Math.max(250, configuredVanillaWaitAssertIntervalMs) : 500;
  var fastTravelForceDisabled = settingEnabled(pluginSettings.fastTravelForceDisabled, true);
  var configuredFastTravelAssertIntervalMs = Number(pluginSettings.fastTravelAssertIntervalMs || 1e3);
  var fastTravelAssertIntervalMs = Number.isFinite(configuredFastTravelAssertIntervalMs) ? Math.max(1e3, configuredFastTravelAssertIntervalMs) : 1e3;
  var survivalModeForceEnabled = settingEnabled(pluginSettings.survivalModeForceEnabled, true);
  var configuredSurvivalModeAssertIntervalMs = Number(pluginSettings.survivalModeAssertIntervalMs || 1e4);
  var survivalModeAssertIntervalMs = Number.isFinite(configuredSurvivalModeAssertIntervalMs) ? Math.max(1e3, configuredSurvivalModeAssertIntervalMs) : 1e4;
  var disableVanillaNpcSpawns = settingEnabled(pluginSettings.disableVanillaNpcSpawns, true);
  var vanillaLootBlockEnabled = settingEnabled(pluginSettings.vanillaLootBlockEnabled, true);
  var serverAuthoritativeNpcSpawns = settingEnabled(pluginSettings.serverAuthoritativeNpcSpawns, true);
  var autoShowMenu = settingEnabled(pluginSettings.autoShowMenu, true);
  var contextMenuHoldKey = rpMenuKeySetting(pluginSettings.contextMenuHoldKey || pluginSettings.holdContextMenu, "X");
  var debugMenuEnabled = settingEnabled(pluginSettings.debugMenuEnabled, false);
  var skillsMenuKey = rpMenuKeySetting(pluginSettings.skillsMenuKey || pluginSettings.holdSkillsMenu, "K");
  var organizationMenuKey = rpMenuKeySetting(pluginSettings.organizationMenuKey, "H");
  var guildMenuKey = rpMenuKeySetting(pluginSettings.guildMenuKey, "G");
  var chatFocusKey = rpMenuKeySetting(pluginSettings.chatFocusKey, "Enter");
  var chatAlternateFocusKey = rpMenuKeySetting(pluginSettings.chatAlternateFocusKey, "");
  var chatFocusKeys = rpMenuKeyList([
    ...splitKeySetting(chatFocusKey),
    ...splitKeySetting(chatAlternateFocusKey)
  ]);
  var closeOverlayKey = settingText(pluginSettings.clearBrowserFocus, "Escape");
  var rpMenuToggleKey = settingText(pluginSettings.rpMenuToggleKey, "F2");
  var rpMenuFocusKey = settingText(pluginSettings.rpMenuFocusKey, "F6");
  var nativeActivationBridgeRequested = settingEnabled(pluginSettings.nativeActivationBridgeEnabled, false);
  var nativeActivationBridgeAllowLegacy = settingEnabled(pluginSettings.nativeActivationBridgeAllowLegacy, false);
  var nativeActivationBridgeEnabled = nativeActivationBridgeRequested && nativeActivationBridgeAllowLegacy;
  var nativeActivationSequenceGlobal = settingText(pluginSettings.nativeActivationSequenceGlobal);
  var nativeActivationTargetGlobal = settingText(pluginSettings.nativeActivationTargetGlobal);
  var nativeActivationTargetMap = normalizeStringMap(
    pluginSettings.nativeActivationTargetMap || {}
  );
  var configuredNativeActivationPollIntervalMs = Number(pluginSettings.nativeActivationPollIntervalMs || 250);
  var nativeActivationPollIntervalMs = Number.isFinite(configuredNativeActivationPollIntervalMs) ? Math.max(100, configuredNativeActivationPollIntervalMs) : 250;
  var nativeActivationEventEnabled = settingEnabled(pluginSettings.nativeActivationEventEnabled, true);
  var nativeActivationEventMap = normalizeActivationMap(
    pluginSettings.nativeActivationEventMap || {}
  );
  var configuredNativeActivationEventCooldownMs = Number(pluginSettings.nativeActivationEventCooldownMs || 1e3);
  var nativeActivationEventCooldownMs = Number.isFinite(configuredNativeActivationEventCooldownMs) ? Math.max(250, configuredNativeActivationEventCooldownMs) : 1e3;
  var nativeActivationEventReportUnmatched = settingEnabled(pluginSettings.nativeActivationEventReportUnmatched, false);
  var runtimeStarterAnchorsEnabled = settingEnabled(pluginSettings.runtimeStarterAnchorsEnabled, false);
  var runtimeStarterAnchorPlugin = settingText(pluginSettings.runtimeStarterAnchorPlugin, "skyrim-rp-world.esp");
  var npcBaseFormMap = normalizeBaseFormMap(pluginSettings.npcBaseFormMap);
  var peerAvatarEnabled = settingEnabled(pluginSettings.peerAvatarEnabled, true);
  var peerAvatarBaseFormId = settingText(pluginSettings.peerAvatarBaseFormId, "0x00000007");
  var peerAvatarBaseFormMap = normalizeBaseFormMap(pluginSettings.peerAvatarBaseFormMap);
  var resourceNodeBridgeEnabled = settingEnabled(pluginSettings.resourceNodeBridgeEnabled, true);
  var resourceGatherKey = settingText(pluginSettings.resourceGatherKey);
  var resourceGatherRadius = Number(pluginSettings.resourceGatherRadius || 180);
  var resourceNodeRequestCooldownMs = Number(pluginSettings.resourceNodeRequestCooldownMs || 1500);
  var onboardingRoomBridgeEnabled = settingEnabled(pluginSettings.onboardingRoomBridgeEnabled, true);
  var configuredRpOverviewIntervalMs = Number(pluginSettings.rpOverviewIntervalMs || 5e3);
  var rpOverviewIntervalMs = Number.isFinite(configuredRpOverviewIntervalMs) ? Math.max(2e3, configuredRpOverviewIntervalMs) : 5e3;
  var walletSyncEnabled = settingEnabled(pluginSettings.walletSyncEnabled, true);
  var walletReconcileEnabled = settingEnabled(pluginSettings.walletReconcileEnabled, true);
  var configuredWalletSyncIntervalMs = Number(pluginSettings.walletSyncIntervalMs || 3e3);
  var walletSyncIntervalMs = Number.isFinite(configuredWalletSyncIntervalMs) ? Math.max(1e3, configuredWalletSyncIntervalMs) : 3e3;
  var protectedVanillaLootLocalFormIds = /* @__PURE__ */ new Set([10, 15]);
  var blockedVanillaLootFormTypes = /* @__PURE__ */ new Set([
    23,
    // ScrollItem
    27,
    // Book
    30,
    // Ingredient
    31,
    // Light
    32,
    // Misc
    45,
    // Key
    46,
    // Potion and food
    52
    // SoulGem
  ]);
  var stage1AutoLoadWorld = settingEnabled(pluginSettings.stage1AutoLoadWorld, false);
  var stage1LoadCell = settingText(pluginSettings.stage1LoadCell, settingText(pluginSettings.cell, "RiverwoodSleepingGiantInn"));
  var stage1LoadWorldOrCell = parseFormIdSetting(pluginSettings.stage1LoadWorldOrCell, 78790);
  var stage1LoadPosition = parseVectorSetting(pluginSettings.stage1LoadPosition, [0, 0, 0]);
  var stage1LoadAngle = parseVectorSetting(pluginSettings.stage1LoadAngle, [0, 0, 0]);
  var configuredStage1WorldLoadFallbackMs = Number(pluginSettings.stage1WorldLoadFallbackMs || 8e3);
  var stage1WorldLoadFallbackMs = Number.isFinite(configuredStage1WorldLoadFallbackMs) ? Math.max(2e3, configuredStage1WorldLoadFallbackMs) : 8e3;
  var configuredStage1WorldLoadStartDelayMs = Number(pluginSettings.stage1WorldLoadStartDelayMs || 1500);
  var stage1WorldLoadStartDelayMs = Number.isFinite(configuredStage1WorldLoadStartDelayMs) ? Math.max(0, configuredStage1WorldLoadStartDelayMs) : 1500;
  var http = createSkyrimPlatformHttpAdapter(HttpClient, backendUrl);
  var reportClientDiagnostic = createClientDiagnosticReporter(http, {
    sourceId: "skyrim-platform-client"
  });
  var npcSpawnBridge = null;
  var peerAvatarBridge = null;
  var resourceNodeBridge = null;
  var onboardingRoomBridge = null;
  var menuController = null;
  var pendingNpcSpawnEvents = [];
  var peerTransformLogAt = /* @__PURE__ */ new Map();
  var pendingStage1WorldLoadSource = null;
  var pendingStage1WorldLoadDueAt = 0;
  var pendingStage1WorldLoadCommandFallback = null;
  var stage1WorldLoadAttempted = false;
  var stage1PlayableWorldLoaded = false;
  var lastStage1PlayableWorldPosition = null;
  var runtimeStarterAnchorAttemptReported = false;
  var runtimeStarterAnchorsDisabledReason = "";
  var survivalModeLastAssertAt = 0;
  var survivalModeDiagnosticSent = false;
  var survivalModeLastError = "";
  var survivalModeInitialLifecycleAsserted = false;
  var vanillaWaitLastAssertAt = 0;
  var vanillaWaitActionDiagnosticSent = false;
  var vanillaWaitActionLastError = "";
  var vanillaWaitTimeRestoreDiagnosticSent = false;
  var vanillaWaitSafeTimeSnapshot = null;
  var vanillaWaitInProgressSnapshot = null;
  var vanillaWaitHotkeySuppressedUntil = 0;
  var fastTravelLastAssertAt = 0;
  var fastTravelDiagnosticSent = false;
  var fastTravelLastError = "";
  var vanillaWaitBlockDiagnosticSent = false;
  var vanillaWaitCloseUnavailableSent = false;
  var inputPollReadyDiagnosticSent = false;
  var buttonEventInputSeen = false;
  var buttonEventDiagnosticSent = false;
  var lastButtonEventHotkeyDiagnosticAt = 0;
  var buttonEventRegistrationAttemptDiagnosticSent = false;
  var buttonEventRegistrationWarningSent = false;
  var lastSkillsMenuToggleDiagnosticAt = 0;
  var lastNativeActivationUnmatchedDiagnosticAt = 0;
  var lastVanillaLootBlockDiagnosticAt = 0;
  var pressedButtonEventCodes = /* @__PURE__ */ new Set();
  var registeredButtonEventCodes = /* @__PURE__ */ new Set();
  var pendingWalletReconciliation = null;
  var walletReconciliationContextWarningSent = false;
  var reconcileSkyrimGold = createSkyrimGoldReconciler({ Game });
  function log(message) {
    const line = `[SkyrimRP] ${message}`;
    try {
      printConsole(line);
    } catch (e) {
    }
    try {
      Debug.notification(line);
    } catch (e) {
    }
    if (message.startsWith("phase=")) {
      markMenuDirty();
    }
  }
  function markMenuDirty() {
    menuController == null ? void 0 : menuController.markDirty();
  }
  function safeRead(reader, fallback) {
    try {
      const value = reader();
      return value === void 0 || value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }
  function safeNumberRead(reader, fallback = 0) {
    const value = safeRead(reader, fallback);
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }
  function readActualPlayerPosition() {
    const player = safeRead(() => Game.getPlayer(), null);
    const worldspace = safeRead(() => {
      var _a;
      return (_a = player == null ? void 0 : player.getWorldSpace()) == null ? void 0 : _a.getName();
    }, "") || "unknown";
    const cell = safeRead(() => {
      var _a;
      return (_a = player == null ? void 0 : player.getParentCell()) == null ? void 0 : _a.getName();
    }, "") || "unknown";
    return {
      playerAvailable: Boolean(player),
      worldspace,
      cell,
      x: safeNumberRead(() => player == null ? void 0 : player.getPositionX()),
      y: safeNumberRead(() => player == null ? void 0 : player.getPositionY()),
      z: safeNumberRead(() => player == null ? void 0 : player.getPositionZ()),
      rotationZ: safeNumberRead(() => player == null ? void 0 : player.getAngleZ())
    };
  }
  var vanillaWaitMenuNames = [
    "Sleep/Wait Menu",
    "SleepWaitMenu",
    "Wait Menu",
    "Sleep Wait Menu",
    "Sleep/Wait",
    "WaitMenu"
  ];
  var fastTravelMenuNames = [
    "Map Menu",
    "MapMenu",
    "World Map Menu",
    "WorldMapMenu"
  ];
  function normalizeActionName(value) {
    return String(value || "").toLowerCase().replace(/[^a-z]/g, "");
  }
  function isVanillaWaitMenuName(value) {
    const normalized = normalizeActionName(value);
    return normalized === "sleepwaitmenu" || normalized === "waitmenu" || normalized === "sleepwait";
  }
  function isFastTravelMenuName(value) {
    const normalized = normalizeActionName(value);
    return normalized === "mapmenu" || normalized === "worldmapmenu";
  }
  function suppressRpHotkeysForVanillaWait(source, durationMs = 750) {
    if (!blockVanillaWait) {
      return;
    }
    vanillaWaitHotkeySuppressedUntil = Math.max(vanillaWaitHotkeySuppressedUntil, Date.now() + durationMs);
    if (source) {
      resetRpMenuPressedState();
      menuController == null ? void 0 : menuController.setInteractionHeld(false);
    }
  }
  function vanillaWaitHotkeysSuppressed() {
    return blockVanillaWait && Date.now() < vanillaWaitHotkeySuppressedUntil;
  }
  function readFirstOpenMenu(menuNames) {
    return menuNames.find((menuName) => safeRead(() => Ui.isMenuOpen(menuName), false)) || "";
  }
  function readMenuState() {
    const sleepWaitMenuName = readFirstOpenMenu(vanillaWaitMenuNames);
    const mapMenuName = readFirstOpenMenu(fastTravelMenuNames);
    return {
      mainMenuOpen: safeRead(() => Ui.isMenuOpen("Main Menu"), false),
      sleepWaitMenuOpen: Boolean(sleepWaitMenuName),
      sleepWaitMenuName,
      mapMenuOpen: Boolean(mapMenuName),
      mapMenuName,
      loadingMenuOpen: safeRead(() => Ui.isMenuOpen("Loading Menu"), false),
      menuMode: safeRead(() => Utility.isInMenuMode(), false)
    };
  }
  var gameTimeGlobalSpecs = [
    { key: "gameHour", globalName: "GameHour", formId: 56 },
    { key: "gameDaysPassed", globalName: "GameDaysPassed", formId: 57 }
  ];
  var survivalModeGlobals = [
    { globalName: "Survival_PlayerHasBeenPrompted", pluginName: "ccQDRSSE001-SurvivalMode.esl", formId: 83888351, value: 1 },
    { globalName: "Survival_ModeCanBeEnabled", pluginName: "ccQDRSSE001-SurvivalMode.esl", formId: 83888655, value: 1 },
    { globalName: "Survival_ModeToggle", pluginName: "ccQDRSSE001-SurvivalMode.esl", formId: 83888168, value: 1 },
    { globalName: "Survival_ModeEnabled", pluginName: "ccQDRSSE001-SurvivalMode.esl", formId: 83888166, value: 1 },
    { globalName: "Survival_ModeEnabledShared", pluginName: "Update.esm", formId: 16789834, value: 1 }
  ];
  function executeConsoleCommand(commandNames, args = []) {
    for (const name of commandNames) {
      const command = findConsoleCommand(name);
      if (!command || typeof command.execute !== "function") {
        continue;
      }
      const attempts = [
        () => command.execute(0, ...args),
        () => command.execute(...args)
      ];
      for (const attempt of attempts) {
        try {
          if (attempt() === true) {
            return { accepted: true, command: command.shortName || command.longName || name };
          }
        } catch (e) {
        }
      }
    }
    return { accepted: false, command: "" };
  }
  function executeSurvivalModeGlobalSet(globalSpec) {
    const candidates = globalSpec.pluginName ? pluginFormLookupIds(globalSpec.formId) : [globalSpec.formId];
    let foundRejected = false;
    let lastError = "";
    for (const candidate of candidates) {
      try {
        const form = globalSpec.pluginName ? Game.getFormFromFile(candidate, globalSpec.pluginName) : Game.getFormEx(candidate);
        if (!form) {
          continue;
        }
        const globalVariable = GlobalVariable.from(form);
        if (!globalVariable) {
          foundRejected = true;
          lastError = `form ${globalSpec.pluginName}:${formatFormId(candidate)} is not a GlobalVariable`;
          continue;
        }
        globalVariable.setValue(globalSpec.value);
        return {
          accepted: true,
          method: `GlobalVariable.setValue(${globalSpec.pluginName}:${formatFormId(candidate)})`,
          currentValue: safeRead(() => globalVariable.getValue(), globalSpec.value)
        };
      } catch (error) {
        lastError = `${globalSpec.pluginName}:${formatFormId(candidate)}: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    const tried = candidates.map((candidate) => formatFormId(candidate)).join(", ");
    return {
      accepted: false,
      method: "GlobalVariable.setValue",
      error: lastError || (foundRejected ? `${globalSpec.globalName} form is not a GlobalVariable` : `${globalSpec.globalName} form was not found in ${globalSpec.pluginName} (tried ${tried})`)
    };
  }
  function executeSurvivalModeSet(globalSpec) {
    const formResult = executeSurvivalModeGlobalSet(globalSpec);
    if (formResult.accepted) {
      return formResult;
    }
    const command = findConsoleCommand("set") || findConsoleCommand("Set");
    if (!command || typeof command.execute !== "function") {
      return {
        accepted: false,
        method: formResult.method,
        error: `${formResult.error}; set console command unavailable`
      };
    }
    const { globalName, value } = globalSpec;
    const attempts = [
      { method: "set-name-value", run: () => command.execute(0, globalName, value) },
      { method: "set-name-to-value", run: () => command.execute(0, globalName, "to", value) },
      { method: "set-expression", run: () => command.execute(0, `${globalName} to ${value}`) },
      { method: "set-name-to-value-no-target", run: () => command.execute(globalName, "to", value) },
      { method: "set-expression-no-target", run: () => command.execute(`${globalName} to ${value}`) }
    ];
    let lastError = "";
    for (const attempt of attempts) {
      try {
        if (attempt.run() === true) {
          return {
            accepted: true,
            method: attempt.method
          };
        }
        lastError = `${attempt.method} returned false`;
      } catch (error) {
        lastError = `${attempt.method}: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    return {
      accepted: false,
      method: "ConsoleCommand.set",
      error: `${formResult.error}; ${lastError || "set command was rejected"}`
    };
  }
  function maybeCloseSurvivalModePrompt(source, force = false) {
    if (!force || !safeRead(() => Ui.isMenuOpen("MessageBoxMenu") || Ui.isMenuOpen("Message Box Menu"), false)) {
      return { attempted: false, closed: false, method: "", error: "" };
    }
    const closeMenu = Ui.closeMenu;
    let error = "";
    if (typeof closeMenu === "function") {
      for (const menuName of ["MessageBoxMenu", "Message Box Menu"]) {
        try {
          closeMenu(menuName);
          log(`closed Survival Mode startup prompt during ${source}`);
          return { attempted: true, closed: true, method: `Ui.closeMenu(${menuName})`, error: "" };
        } catch (closeError) {
          error = closeError instanceof Error ? closeError.message : String(closeError);
        }
      }
    } else {
      error = "Ui.closeMenu unavailable";
    }
    for (const menuName of ["MessageBoxMenu", "Message Box Menu"]) {
      const closeSpecific = executeConsoleCommand(["CloseMenu", "CloseMenuCommand"], [menuName]);
      if (closeSpecific.accepted) {
        log(`closed Survival Mode startup prompt during ${source}`);
        return { attempted: true, closed: true, method: `${closeSpecific.command}(${menuName})`, error: "" };
      }
      error = closeSpecific.command || error || "CloseMenu command rejected";
    }
    return { attempted: true, closed: false, method: "", error };
  }
  function maybeAssertSurvivalModePolicy(source, force = false) {
    if (!survivalModeForceEnabled) {
      return;
    }
    const nowMs = Date.now();
    if (!force && nowMs - survivalModeLastAssertAt < survivalModeAssertIntervalMs) {
      return;
    }
    survivalModeLastAssertAt = nowMs;
    const results = survivalModeGlobals.map((globalSpec) => __spreadValues({
      globalName: globalSpec.globalName,
      value: globalSpec.value,
      pluginName: globalSpec.pluginName,
      formId: formatFormId(globalSpec.formId)
    }, executeSurvivalModeSet(globalSpec)));
    const failures = results.filter((result) => !result.accepted);
    const error = failures.map((failure) => `${failure.globalName}: ${"error" in failure ? failure.error || "rejected" : "rejected"}`).join("; ");
    const promptMenu = failures.length === 0 ? maybeCloseSurvivalModePrompt(source, force) : { attempted: false, closed: false, method: "", error: "" };
    if (failures.length === 0) {
      if (!survivalModeDiagnosticSent) {
        log("Survival Mode policy forced on.");
      }
      survivalModeLastError = "";
    } else if (error && error !== survivalModeLastError) {
      survivalModeLastError = error;
      log(`Survival Mode policy assertion incomplete: ${error}`);
    }
    if (!survivalModeDiagnosticSent || failures.length > 0 || force) {
      survivalModeDiagnosticSent = true;
      void reportClientDiagnostic("survival_mode_policy", {
        source,
        force,
        enabled: survivalModeForceEnabled,
        promptSuppressed: true,
        promptMenu,
        globals: results
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
  }
  function maybeAssertInitialSurvivalModePolicy(source) {
    if (survivalModeInitialLifecycleAsserted) {
      return;
    }
    survivalModeInitialLifecycleAsserted = true;
    maybeAssertSurvivalModePolicy(source, true);
  }
  function readGameTimeGlobal(spec) {
    const lookups = [
      () => Game.getForm(spec.formId),
      () => Game.getFormEx(spec.formId),
      () => Game.getFormFromFile(spec.formId, "Skyrim.esm")
    ];
    let lastError = "";
    for (const lookup of lookups) {
      try {
        const form = lookup();
        if (!form) {
          continue;
        }
        const globalVariable = GlobalVariable.from(form);
        if (!globalVariable) {
          lastError = `${spec.globalName} form is not a GlobalVariable`;
          continue;
        }
        return {
          globalVariable,
          value: safeNumberRead(() => globalVariable.getValue(), 0),
          error: ""
        };
      } catch (error) {
        lastError = `${spec.globalName}: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    return {
      globalVariable: null,
      value: null,
      error: lastError || `${spec.globalName} [GLOB:${formatFormId(spec.formId)}] was not found`
    };
  }
  function readGameTimeSnapshot(source) {
    const values = {
      gameHour: null,
      gameDaysPassed: null
    };
    const errors = [];
    for (const spec of gameTimeGlobalSpecs) {
      const result = readGameTimeGlobal(spec);
      if (Number.isFinite(Number(result.value))) {
        values[spec.key] = Number(result.value);
      } else {
        errors.push(result.error || `${spec.globalName} unavailable`);
      }
    }
    const currentGameTime = safeRead(() => {
      const utilityApi = Utility;
      return typeof utilityApi.getCurrentGameTime === "function" ? utilityApi.getCurrentGameTime() : null;
    }, null);
    return {
      source,
      capturedAtMs: Date.now(),
      gameHour: values.gameHour,
      gameDaysPassed: values.gameDaysPassed,
      currentGameTime: Number.isFinite(Number(currentGameTime)) ? Number(currentGameTime) : null,
      complete: values.gameHour !== null && values.gameDaysPassed !== null,
      error: errors.join("; ")
    };
  }
  function restoreGameTimeSnapshot(snapshot, source) {
    if (!snapshot || !snapshot.complete) {
      return {
        accepted: false,
        source,
        restored: [],
        error: (snapshot == null ? void 0 : snapshot.error) || "no complete pre-wait game-time snapshot available"
      };
    }
    const restored = [];
    const errors = [];
    for (const spec of gameTimeGlobalSpecs) {
      const targetValue = snapshot[spec.key];
      if (!Number.isFinite(Number(targetValue))) {
        errors.push(`${spec.globalName} snapshot missing`);
        continue;
      }
      const result = readGameTimeGlobal(spec);
      if (!result.globalVariable) {
        errors.push(result.error || `${spec.globalName} unavailable`);
        continue;
      }
      try {
        result.globalVariable.setValue(Number(targetValue));
        restored.push(spec.globalName);
      } catch (error) {
        errors.push(`${spec.globalName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    const accepted = restored.length === gameTimeGlobalSpecs.length && errors.length === 0;
    if (accepted) {
      vanillaWaitSafeTimeSnapshot = __spreadProps(__spreadValues({}, snapshot), {
        source,
        capturedAtMs: Date.now()
      });
    }
    return {
      accepted,
      source,
      restored,
      snapshot: {
        source: snapshot.source,
        capturedAtMs: snapshot.capturedAtMs,
        gameHour: snapshot.gameHour,
        gameDaysPassed: snapshot.gameDaysPassed,
        currentGameTime: snapshot.currentGameTime
      },
      error: errors.join("; ")
    };
  }
  function rememberVanillaWaitSafeTime(source) {
    if (!blockVanillaWait || vanillaWaitInProgressSnapshot) {
      return null;
    }
    const menuState = readMenuState();
    if (menuState.sleepWaitMenuOpen) {
      return null;
    }
    const snapshot = readGameTimeSnapshot(source);
    if (snapshot.complete) {
      vanillaWaitSafeTimeSnapshot = snapshot;
    }
    return snapshot;
  }
  function executeVanillaWaitActionDisabled() {
    const inputApi = Input;
    const eventNames = ["Wait", "WaitMenu", "SleepWait"];
    const attempts = [
      {
        method: "Input.disableUserEvent",
        fn: inputApi.disableUserEvent ? (eventName) => {
          var _a;
          return (_a = inputApi.disableUserEvent) == null ? void 0 : _a.call(inputApi, eventName);
        } : null
      },
      {
        method: "Input.blockUserEvent",
        fn: inputApi.blockUserEvent ? (eventName) => {
          var _a;
          return (_a = inputApi.blockUserEvent) == null ? void 0 : _a.call(inputApi, eventName);
        } : null
      },
      {
        method: "Input.disableControl",
        fn: inputApi.disableControl ? (eventName) => {
          var _a;
          return (_a = inputApi.disableControl) == null ? void 0 : _a.call(inputApi, eventName);
        } : null
      },
      {
        method: "Input.setUserEventEnabled",
        fn: inputApi.setUserEventEnabled ? (eventName) => {
          var _a;
          return (_a = inputApi.setUserEventEnabled) == null ? void 0 : _a.call(inputApi, eventName, false);
        } : null
      },
      {
        method: "Input.setControlEnabled",
        fn: inputApi.setControlEnabled ? (eventName) => {
          var _a;
          return (_a = inputApi.setControlEnabled) == null ? void 0 : _a.call(inputApi, eventName, false);
        } : null
      }
    ];
    let lastError = "";
    for (const attempt of attempts) {
      if (!attempt.fn) {
        continue;
      }
      for (const eventName of eventNames) {
        try {
          const result = attempt.fn(eventName);
          if (result !== false) {
            return {
              accepted: true,
              method: `${attempt.method}(${eventName})`
            };
          }
          lastError = `${attempt.method}(${eventName}) returned false`;
        } catch (error) {
          lastError = `${attempt.method}(${eventName}): ${error instanceof Error ? error.message : String(error)}`;
        }
      }
    }
    return {
      accepted: false,
      method: "runtime menuOpen/waitStart/waitStop guard",
      error: lastError || "direct wait-control API unavailable"
    };
  }
  function maybeAssertVanillaWaitPolicy(source, force = false) {
    if (!blockVanillaWait) {
      return;
    }
    const nowMs = Date.now();
    if (!force && nowMs - vanillaWaitLastAssertAt < vanillaWaitAssertIntervalMs) {
      return;
    }
    vanillaWaitLastAssertAt = nowMs;
    const result = executeVanillaWaitActionDisabled();
    const snapshot = rememberVanillaWaitSafeTime(source);
    const error = result.accepted ? "" : "error" in result ? result.error || "rejected" : "rejected";
    const errorChanged = error !== vanillaWaitActionLastError;
    if (result.accepted) {
      if (!vanillaWaitActionDiagnosticSent) {
        log("Vanilla wait/time-skip action disabled.");
      }
      vanillaWaitActionLastError = "";
    } else if (!vanillaWaitActionDiagnosticSent) {
      log("Vanilla wait/time-skip action guard armed.");
    }
    if (!vanillaWaitActionDiagnosticSent || force || !result.accepted && errorChanged) {
      vanillaWaitActionDiagnosticSent = true;
      vanillaWaitActionLastError = error;
      void reportClientDiagnostic("vanilla_wait_policy", {
        source,
        force,
        blockVanillaWait,
        disabledVanillaControls,
        vanillaWaitAssertIntervalMs,
        method: result.method,
        accepted: result.accepted,
        error,
        menuNames: vanillaWaitMenuNames,
        eventGuards: ["menuOpen", "waitStart", "waitStop", "sleepStart", "sleepStop"],
        timeRestoreGlobals: gameTimeGlobalSpecs.map((spec) => `${spec.globalName}:${formatFormId(spec.formId)}`),
        safeSnapshotReady: Boolean(vanillaWaitSafeTimeSnapshot == null ? void 0 : vanillaWaitSafeTimeSnapshot.complete),
        snapshotError: (snapshot == null ? void 0 : snapshot.error) || ""
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
  }
  function executeFastTravelDisabled() {
    const gameApi = Game;
    const directAttempts = [
      { method: "Game.enableFastTravel", fn: gameApi.enableFastTravel },
      { method: "Game.setFastTravelEnabled", fn: gameApi.setFastTravelEnabled }
    ];
    for (const attempt of directAttempts) {
      if (typeof attempt.fn !== "function") {
        continue;
      }
      try {
        attempt.fn(false);
        return {
          accepted: true,
          method: attempt.method
        };
      } catch (error) {
        return {
          accepted: false,
          method: attempt.method,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    const command = findConsoleCommand("EnableFastTravel") || findConsoleCommand("enablefasttravel");
    if (!command || typeof command.execute !== "function") {
      return {
        accepted: false,
        method: "ConsoleCommand.EnableFastTravel",
        error: "EnableFastTravel console command unavailable"
      };
    }
    const attempts = [
      { method: "enablefasttravel-target-number", run: () => command.execute(0, 0) },
      { method: "enablefasttravel-target-string", run: () => command.execute(0, "0") },
      { method: "enablefasttravel-number", run: () => command.execute(0) },
      { method: "enablefasttravel-string", run: () => command.execute("0") },
      { method: "enablefasttravel-target-false", run: () => command.execute(0, false) },
      { method: "enablefasttravel-false", run: () => command.execute(false) }
    ];
    let lastError = "";
    for (const attempt of attempts) {
      try {
        if (attempt.run() === true) {
          return {
            accepted: true,
            method: attempt.method
          };
        }
        lastError = `${attempt.method} returned false`;
      } catch (error) {
        lastError = `${attempt.method}: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    return {
      accepted: false,
      method: "ConsoleCommand.EnableFastTravel",
      error: lastError || "EnableFastTravel command was rejected"
    };
  }
  function maybeAssertFastTravelPolicy(source, force = false) {
    if (!fastTravelForceDisabled) {
      return;
    }
    const nowMs = Date.now();
    if (!force && nowMs - fastTravelLastAssertAt < fastTravelAssertIntervalMs) {
      return;
    }
    fastTravelLastAssertAt = nowMs;
    const result = executeFastTravelDisabled();
    const error = result.accepted ? "" : "error" in result ? result.error || "rejected" : "rejected";
    if (result.accepted) {
      if (!fastTravelDiagnosticSent) {
        log("Fast travel policy forced off.");
      }
      fastTravelLastError = "";
    } else if (error && error !== fastTravelLastError) {
      fastTravelLastError = error;
      log(`Fast travel policy assertion incomplete: ${error}`);
    }
    if (!fastTravelDiagnosticSent || !result.accepted || force) {
      fastTravelDiagnosticSent = true;
      void reportClientDiagnostic("fast_travel_policy", {
        source,
        force,
        disabled: fastTravelForceDisabled,
        method: result.method,
        accepted: result.accepted,
        error,
        note: "Fast travel is disabled directly; combat state is not used."
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
  }
  function maybeBlockVanillaWaitMenu(source) {
    if (!blockVanillaWait) {
      return { attempted: false, closed: false, method: "", error: "" };
    }
    suppressRpHotkeysForVanillaWait(source);
    const menuState = readMenuState();
    const forced = source === "menu_open_wait" || source === "wait_start" || source === "sleep_start";
    if (!menuState.sleepWaitMenuOpen && !forced) {
      return { attempted: false, closed: false, method: "", error: "" };
    }
    const closeMenu = Ui.closeMenu;
    let closed = false;
    let method = "";
    let error = "";
    if (typeof closeMenu === "function") {
      for (const menuName of vanillaWaitMenuNames) {
        try {
          closeMenu(menuName);
          closed = true;
          method = `Ui.closeMenu(${menuName})`;
          break;
        } catch (closeError) {
          error = closeError instanceof Error ? closeError.message : String(closeError);
        }
      }
    } else {
      error = "Ui.closeMenu unavailable";
    }
    if (!closed) {
      for (const menuName of vanillaWaitMenuNames) {
        const closeSpecific = executeConsoleCommand(["CloseMenu", "CloseMenuCommand"], [menuName]);
        if (closeSpecific.accepted) {
          closed = true;
          method = `${closeSpecific.command}(${menuName})`;
          error = "";
          break;
        }
        error = closeSpecific.command || error || `CloseMenu(${menuName}) rejected`;
      }
    }
    if (!closed) {
      const closeAll = executeConsoleCommand(["CloseAllMenus", "CloseAllMenusCommand", "cam"]);
      if (closeAll.accepted) {
        closed = true;
        method = closeAll.command || "CloseAllMenus";
        error = "";
      }
    }
    const shouldReport = closed || !vanillaWaitCloseUnavailableSent;
    if (closed && !vanillaWaitBlockDiagnosticSent) {
      vanillaWaitBlockDiagnosticSent = true;
      log("Vanilla wait/time-skip menu blocked.");
    } else if (!closed && !vanillaWaitCloseUnavailableSent) {
      vanillaWaitCloseUnavailableSent = true;
      log(`Vanilla wait/time-skip menu detected but could not be closed: ${error}`);
    }
    if (shouldReport) {
      void reportClientDiagnostic("vanilla_wait_blocked", __spreadValues({
        source,
        closed,
        error,
        disabledVanillaControls,
        blockVanillaWait,
        method
      }, menuState)).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
    return { attempted: true, closed, method, error };
  }
  function runtimeEventField(event, fieldNames) {
    if (!event || typeof event !== "object") {
      return "";
    }
    const record = event;
    for (const fieldName of fieldNames) {
      const value = record[fieldName];
      if (value !== void 0 && value !== null && String(value)) {
        return String(value);
      }
    }
    return "";
  }
  function runtimeEventMenuName(event) {
    return runtimeEventField(event, ["menuName", "name", "menu", "menuId"]);
  }
  function reportVanillaTimeSkipAction(source, eventName, restoreResult) {
    const shouldReport = !vanillaWaitTimeRestoreDiagnosticSent || !restoreResult.accepted;
    if (restoreResult.accepted && !vanillaWaitTimeRestoreDiagnosticSent) {
      vanillaWaitTimeRestoreDiagnosticSent = true;
      log("Vanilla wait/time-skip action blocked; game time restored.");
    } else if (!restoreResult.accepted && restoreResult.error) {
      log(`Vanilla wait/time-skip restore incomplete: ${restoreResult.error}`);
    }
    if (!shouldReport) {
      return;
    }
    void reportClientDiagnostic("vanilla_wait_action_blocked", __spreadValues({
      source,
      eventName,
      restored: restoreResult.accepted,
      restoreResult,
      blockVanillaWait,
      disabledVanillaControls
    }, readMenuState())).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
  }
  function handleVanillaWaitMenuOpen(event) {
    if (!blockVanillaWait) {
      return;
    }
    const menuName = runtimeEventMenuName(event);
    if (!isVanillaWaitMenuName(menuName)) {
      return;
    }
    suppressRpHotkeysForVanillaWait("menu_open_wait", 1500);
    maybeAssertVanillaWaitPolicy("menu_open_wait", true);
    maybeBlockVanillaWaitMenu("menu_open_wait");
  }
  function handleVanillaTimeSkipStart(eventName, event) {
    if (!blockVanillaWait) {
      return;
    }
    const eventSource = runtimeEventField(event, ["eventName", "type"]) || eventName;
    suppressRpHotkeysForVanillaWait(eventName, 1500);
    const snapshot = readGameTimeSnapshot(eventName);
    vanillaWaitInProgressSnapshot = vanillaWaitSafeTimeSnapshot || (snapshot.complete ? snapshot : null);
    maybeBlockVanillaWaitMenu(eventName);
    const restoreResult = restoreGameTimeSnapshot(vanillaWaitInProgressSnapshot, `${eventName}_start`);
    reportVanillaTimeSkipAction(`${eventName}_start`, eventSource, restoreResult);
  }
  function handleVanillaTimeSkipStop(eventName, event) {
    if (!blockVanillaWait) {
      return;
    }
    const eventSource = runtimeEventField(event, ["eventName", "type"]) || eventName;
    suppressRpHotkeysForVanillaWait(eventName, 1500);
    const restoreResult = restoreGameTimeSnapshot(vanillaWaitInProgressSnapshot || vanillaWaitSafeTimeSnapshot, `${eventName}_stop`);
    vanillaWaitInProgressSnapshot = null;
    maybeBlockVanillaWaitMenu(eventName);
    reportVanillaTimeSkipAction(`${eventName}_stop`, eventSource, restoreResult);
  }
  function registerRuntimeEvent(eventName, callback) {
    try {
      on(eventName, callback);
      return true;
    } catch (error) {
      void reportClientDiagnostic("runtime_event_registration_failed", {
        eventName,
        error: error instanceof Error ? error.message : String(error)
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
      return false;
    }
  }
  function registerVanillaWaitPolicyEvents() {
    if (!blockVanillaWait) {
      return;
    }
    const registeredEvents = [
      registerRuntimeEvent("menuOpen", handleVanillaWaitMenuOpen) ? "menuOpen" : "",
      registerRuntimeEvent("waitStart", (event) => handleVanillaTimeSkipStart("wait_start", event)) ? "waitStart" : "",
      registerRuntimeEvent("waitStop", (event) => handleVanillaTimeSkipStop("wait_stop", event)) ? "waitStop" : "",
      registerRuntimeEvent("sleepStart", (event) => handleVanillaTimeSkipStart("sleep_start", event)) ? "sleepStart" : "",
      registerRuntimeEvent("sleepStop", (event) => handleVanillaTimeSkipStop("sleep_stop", event)) ? "sleepStop" : ""
    ].filter(Boolean);
    void reportClientDiagnostic("vanilla_wait_event_policy", {
      registeredEvents,
      menuNames: vanillaWaitMenuNames,
      timeRestoreGlobals: gameTimeGlobalSpecs.map((spec) => `${spec.globalName}:${formatFormId(spec.formId)}`)
    }).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
  }
  function handleFastTravelMenuOpen(event) {
    const runtimeEvent = event || {};
    const menuName = runtimeEvent.menuName || runtimeEvent.name || runtimeEvent.type || "";
    if (menuName && !isFastTravelMenuName(menuName)) {
      return;
    }
    const menuState = readMenuState();
    if (!isFastTravelMenuName(menuName) && !menuState.mapMenuOpen) {
      return;
    }
    maybeAssertFastTravelPolicy("map_menu_open", true);
  }
  function registerFastTravelPolicyEvents() {
    if (!fastTravelForceDisabled) {
      return;
    }
    const registeredEvents = [
      registerRuntimeEvent("menuOpen", handleFastTravelMenuOpen) ? "menuOpen" : "",
      registerRuntimeEvent("fastTravelEnd", () => {
        maybeAssertFastTravelPolicy("fast_travel_end", true);
      }) ? "fastTravelEnd" : ""
    ].filter(Boolean);
    void reportClientDiagnostic("fast_travel_event_policy", {
      registeredEvents,
      menuNames: fastTravelMenuNames,
      assertIntervalMs: fastTravelAssertIntervalMs,
      method: "EnableFastTravel 0 reasserted on startup, world load, map menu open, periodic tick, and fastTravelEnd"
    }).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
  }
  function hasStage1PlayerPosition(actual) {
    return Math.abs(actual.x) > 1 || Math.abs(actual.y) > 1 || Math.abs(actual.z) > 1;
  }
  function isCurrentStage1WorldPosition(actual) {
    return actual.playerAvailable && (actual.cell !== "unknown" || actual.worldspace !== "unknown" || hasStage1PlayerPosition(actual));
  }
  function isActualStage1WorldPosition(actual) {
    const menuState = readMenuState();
    if (!menuState.mainMenuOpen && !menuState.loadingMenuOpen && isCurrentStage1WorldPosition(actual)) {
      stage1PlayableWorldLoaded = true;
      lastStage1PlayableWorldPosition = actual;
      pendingStage1WorldLoadSource = null;
      pendingStage1WorldLoadDueAt = 0;
      pendingStage1WorldLoadCommandFallback = null;
      return true;
    }
    return stage1PlayableWorldLoaded;
  }
  function lastKnownStage1Position(actual) {
    return isCurrentStage1WorldPosition(actual) ? actual : lastStage1PlayableWorldPosition || actual;
  }
  function displayWorldspace(actual) {
    const displayActual = lastKnownStage1Position(actual);
    return displayActual.worldspace !== "unknown" ? displayActual.worldspace : pluginSettings.worldspace || "unknown";
  }
  function displayCell(actual) {
    const displayActual = lastKnownStage1Position(actual);
    return displayActual.cell !== "unknown" ? displayActual.cell : stage1LoadCell || pluginSettings.cell || "unknown";
  }
  function getPlayerPosition() {
    const actual = readActualPlayerPosition();
    if (isActualStage1WorldPosition(actual)) {
      return __spreadProps(__spreadValues({}, actual), {
        worldspace: displayWorldspace(actual),
        cell: displayCell(actual)
      });
    }
    return {
      worldspace: pluginSettings.worldspace || "unknown",
      cell: pluginSettings.cell || "unknown",
      x: 0,
      y: 0,
      z: 0,
      rotationZ: 0
    };
  }
  function isPlayableWorldLoaded() {
    const actual = readActualPlayerPosition();
    return isActualStage1WorldPosition(actual);
  }
  function getJoinIdentity(state = joinClient.getState()) {
    var _a, _b, _c;
    return {
      clientId: String(((_a = state == null ? void 0 : state.welcome) == null ? void 0 : _a.clientId) || ""),
      characterId: String(((_b = state == null ? void 0 : state.character) == null ? void 0 : _b.id) || ""),
      characterName: String(((_c = state == null ? void 0 : state.character) == null ? void 0 : _c.name) || "")
    };
  }
  function getStage1WorldState() {
    const actual = readActualPlayerPosition();
    const menuState = readMenuState();
    const worldLoaded = isActualStage1WorldPosition(actual);
    return __spreadValues({
      worldLoaded,
      worldLoadPending: Boolean(pendingStage1WorldLoadSource || pendingStage1WorldLoadCommandFallback),
      worldLoadAttempted: stage1WorldLoadAttempted,
      worldLoadFallbackPending: Boolean(pendingStage1WorldLoadCommandFallback),
      stage1AutoLoadWorld,
      stage1LoadCell,
      stage1LoadWorldOrCell: formatFormId(stage1LoadWorldOrCell),
      actualWorldspace: displayWorldspace(actual),
      actualCell: displayCell(actual)
    }, menuState);
  }
  function describePeer(peer) {
    return `${peer.overlayName || peer.displayName} ${peer.position.worldspace}/${peer.position.cell} (${Math.round(peer.position.x)}, ${Math.round(peer.position.y)}, ${Math.round(peer.position.z)})`;
  }
  function handlePeerEvent(event) {
    var _a;
    try {
      peerAvatarBridge == null ? void 0 : peerAvatarBridge.handlePeerEvent(event);
    } catch (error) {
      log(`peer avatar event failed type=${event.type}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (event.type === "snapshot") {
      log(`peer snapshot count=${event.peers.length}`);
      return;
    }
    if (event.type === "left") {
      log(`peer left clientId=${event.clientId}`);
      return;
    }
    if (event.type === "joined") {
      log(`peer joined ${describePeer(event.peer)}`);
      return;
    }
    if (event.type === "identity") {
      log(`peer identity ${event.peer.displayName} known=${event.peer.identityKnown === true}`);
      markMenuDirty();
      return;
    }
    if (event.type === "inspect") {
      log(`peer inspect ${event.peer.displayName} known=${event.peer.identityKnown === true}`);
      markMenuDirty();
      return;
    }
    if (event.type === "voice_state") {
      const name = ((_a = event.peer) == null ? void 0 : _a.displayName) || event.clientId;
      log(`peer voice ${name} speaking=${event.speaking}`);
      return;
    }
    const lastLoggedAt = peerTransformLogAt.get(event.clientId) || 0;
    const now = Date.now();
    if (now - lastLoggedAt > 5e3) {
      peerTransformLogAt.set(event.clientId, now);
      log(`peer transform ${describePeer(event.peer)}`);
    }
  }
  function handleOwnerSnapshot(snapshot) {
    var _a, _b;
    storage["skyrimRpOwnerSnapshot"] = snapshot;
    onboardingRoomBridge == null ? void 0 : onboardingRoomBridge.setOnboarding(snapshot.onboarding || null);
    log(
      `owner snapshot reason=${snapshot.reason} wallet=${(_b = (_a = snapshot.character) == null ? void 0 : _a.wallet) != null ? _b : 0} inventory=${snapshot.inventory.length} jobs=${snapshot.jobs.length} properties=${snapshot.properties.length}`
    );
    queueWalletReconciliation(snapshot);
    markMenuDirty();
  }
  function queueWalletReconciliation(snapshot) {
    var _a, _b, _c;
    const reconciliation = snapshot.walletReconciliation;
    if (!walletReconcileEnabled || (reconciliation == null ? void 0 : reconciliation.applySkyrimGold) !== true) {
      return;
    }
    const targetGold = Number((_a = snapshot.character) == null ? void 0 : _a.wallet);
    if (!Number.isInteger(targetGold) || targetGold < 0 || targetGold > 2147483647) {
      log(`wallet reconcile skipped invalid target reason=${snapshot.reason}`);
      reportClientDiagnostic("wallet_reconcile_invalid_target", {
        reason: snapshot.reason,
        wallet: (_c = (_b = snapshot.character) == null ? void 0 : _b.wallet) != null ? _c : null
      }).catch((error) => log(`diagnostic failed: ${error.message || String(error)}`));
      return;
    }
    pendingWalletReconciliation = {
      targetGold,
      reason: reconciliation.reason || snapshot.reason,
      requestedAt: Date.now()
    };
    tryApplyPendingWalletReconciliation("owner_snapshot");
  }
  function tryApplyPendingWalletReconciliation(trigger) {
    if (!walletReconcileEnabled || !pendingWalletReconciliation) {
      return false;
    }
    if (joinClient.getState().phase !== "joined" || !isPlayableWorldLoaded()) {
      return false;
    }
    const pending = pendingWalletReconciliation;
    try {
      const result = reconcileSkyrimGold(pending.targetGold);
      storage["skyrimRpWalletReconciliation"] = __spreadProps(__spreadValues(__spreadValues({}, pending), result), {
        trigger,
        appliedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (result.applied) {
        log(`wallet reconcile gold ${result.before}->${result.after} reason=${pending.reason}`);
      } else {
        log(`wallet reconcile skipped reason=${pending.reason} status=${result.reason || "unchanged"}`);
      }
      joinClient.syncWalletGold(pending.targetGold, {
        source: "server_authoritative_wallet",
        reason: `Server wallet reconciliation: ${pending.reason}`
      });
      pendingWalletReconciliation = null;
      walletReconciliationContextWarningSent = false;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (skyrimPlatformContextError(error)) {
        if (!walletReconciliationContextWarningSent) {
          walletReconciliationContextWarningSent = true;
          log(`wallet reconcile waiting for playable world: ${message}`);
        }
        return false;
      }
      pendingWalletReconciliation = null;
      log(`wallet reconcile failed: ${message}`);
      reportClientDiagnostic("wallet_reconcile_failed", {
        reason: pending.reason,
        targetGold: pending.targetGold,
        error: message
      }).catch((diagnosticError) => log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`));
      return false;
    }
  }
  function handleTradeEvent(event) {
    var _a, _b, _c, _d;
    storage["skyrimRpTradeEvent"] = event;
    if (event.type === "trade_request_sent" || event.type === "trade_request_received") {
      log(`trade request ${event.type === "trade_request_sent" ? "sent" : "received"} peer=${((_a = event.peer) == null ? void 0 : _a.displayName) || "Unknown Character"}`);
      markMenuDirty();
      return;
    }
    if (event.type === "trade_result") {
      log(`trade result buyer=${((_b = event.trade) == null ? void 0 : _b.buyerCode) || "unknown"} total=${(_d = (_c = event.trade) == null ? void 0 : _c.total) != null ? _d : 0}`);
    }
    markMenuDirty();
  }
  function handleChatEvent(event) {
    var _a, _b, _c, _d, _e, _f;
    storage["skyrimRpChatEvent"] = event;
    menuController == null ? void 0 : menuController.notifyChatEvent(event);
    if (event.type === "chat_denied") {
      log(`chat denied ${event.reason || "muted"}`);
      markMenuDirty();
      return;
    }
    if (event.type === "staff_direct_message_sent" || event.type === "staff_direct_message_received") {
      const direction = event.type === "staff_direct_message_sent" ? "sent to" : "from";
      const peer = ((_a = event.peer) == null ? void 0 : _a.displayName) || "Unknown Character";
      const text5 = ((_b = event.message) == null ? void 0 : _b.text) || "";
      log(`staff dm ${direction} ${peer}: ${text5}`);
      markMenuDirty();
      return;
    }
    if (event.type === "chat_message") {
      const channel = ((_c = event.message) == null ? void 0 : _c.kind) || ((_d = event.message) == null ? void 0 : _d.channel) || "local";
      const speaker = ((_e = event.message) == null ? void 0 : _e.displayName) || "Unknown Character";
      const text5 = ((_f = event.message) == null ? void 0 : _f.text) || "";
      log(`chat ${channel} ${speaker}: ${text5}`);
      markMenuDirty();
    }
  }
  function handleCraftEvent(event) {
    var _a, _b, _c, _d;
    storage["skyrimRpCraftEvent"] = event;
    log(`craft result recipe=${((_b = (_a = event.craft) == null ? void 0 : _a.recipe) == null ? void 0 : _b.code) || "unknown"} produced=${((_d = (_c = event.craft) == null ? void 0 : _c.produced) == null ? void 0 : _d.itemCode) || "unknown"}`);
    markMenuDirty();
  }
  function handleSpellEvent(event) {
    var _a, _b, _c;
    storage["skyrimRpSpellEvent"] = event;
    log(`spell learn ${((_b = (_a = event.result) == null ? void 0 : _a.spell) == null ? void 0 : _b.code) || "unknown"} tome=${((_c = event.result) == null ? void 0 : _c.consumedItemCode) || "unknown"}`);
    markMenuDirty();
  }
  function handleResourceEvent(event) {
    var _a, _b;
    resourceNodeBridge == null ? void 0 : resourceNodeBridge.handleResourceEvent(event);
    storage["skyrimRpResourceEvent"] = event;
    if (event.type === "snapshot") {
      log(`resource snapshot count=${event.nodes.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "updated") {
      log(`resource updated ${event.node.displayName || event.nodeCode} state=${event.node.state}`);
      markMenuDirty();
      return;
    }
    log(`resource gather ${((_a = event.node) == null ? void 0 : _a.displayName) || "unknown"} state=${((_b = event.node) == null ? void 0 : _b.state) || "unknown"}`);
    markMenuDirty();
  }
  function handleOnboardingEvent(event) {
    var _a, _b;
    onboardingRoomBridge == null ? void 0 : onboardingRoomBridge.handleOnboardingEvent(event);
    storage["skyrimRpOnboardingEvent"] = event;
    if (event.type === "onboarding_tip_acknowledged") {
      const tip = (_a = event.result) == null ? void 0 : _a.tip;
      log(`onboarding tip ${(tip == null ? void 0 : tip.code) || "unknown"}`);
      if (tip == null ? void 0 : tip.text) {
        menuController == null ? void 0 : menuController.setLastAction(tip.text);
      }
      markMenuDirty();
      return;
    }
    const destination = (_b = event.result) == null ? void 0 : _b.destination;
    log(`onboarding portal ${(destination == null ? void 0 : destination.code) || "unknown"} approved`);
    menuController == null ? void 0 : menuController.setLastAction(`${(destination == null ? void 0 : destination.displayName) || "Starter"} portal approved.`);
    markMenuDirty();
  }
  function showOnboardingTip(tip) {
    const message = tip.text || tip.displayName || "Onboarding tip";
    menuController == null ? void 0 : menuController.setLastAction(message);
    menuController == null ? void 0 : menuController.show(false);
    markMenuDirty();
  }
  function loadOnboardingDestination(request) {
    const destination = request.destination;
    const position = destination == null ? void 0 : destination.position;
    if (!destination || !position) {
      return false;
    }
    try {
      const worldOrCell = parseFormIdSetting(destination.worldOrCell, stage1LoadWorldOrCell);
      const loadPosition = [
        Number(position.x || 0),
        Number(position.y || 0),
        Number(position.z || 0)
      ];
      const loadAngle = [0, 0, Number(position.rotationZ || 0)];
      const state = joinClient.getState();
      const playerName = getJoinIdentity(state).characterName || pluginSettings.displayName || pluginSettings.characterName || "Skyrim RP Player";
      log(`onboarding load destination ${destination.code || "unknown"} ${formatFormId(worldOrCell)}`);
      loadGame(loadPosition, loadAngle, worldOrCell, { name: playerName });
      menuController == null ? void 0 : menuController.setLastAction(`Loading ${destination.displayName || "starter location"}...`);
      markMenuDirty();
      void reportClientDiagnostic("onboarding_portal_load", {
        destinationCode: destination.code || "",
        displayName: destination.displayName || "",
        worldOrCell: formatFormId(worldOrCell),
        position: loadPosition,
        angle: loadAngle
      }).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`onboarding portal load failed: ${message}`);
      menuController == null ? void 0 : menuController.setLastAction(`Portal load failed: ${message}`);
      markMenuDirty();
      void reportClientDiagnostic("onboarding_portal_load_failed", {
        destinationCode: destination.code || "",
        error: message
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
      return false;
    }
  }
  function handleJobEvent(event) {
    var _a, _b, _c, _d, _e, _f, _g;
    storage["skyrimRpJobEvent"] = event;
    if (event.type === "job_board") {
      log(`job board count=${event.jobs.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "job_claim_result") {
      log(`job claim ${((_a = event.claim) == null ? void 0 : _a.jobCode) || ((_b = event.claim) == null ? void 0 : _b.id) || "unknown"} status=${((_c = event.claim) == null ? void 0 : _c.status) || "unknown"}`);
      markMenuDirty();
      return;
    }
    log(`job complete ${((_e = (_d = event.result) == null ? void 0 : _d.claim) == null ? void 0 : _e.id) || "unknown"} status=${((_g = (_f = event.result) == null ? void 0 : _f.claim) == null ? void 0 : _g.status) || "unknown"}`);
    markMenuDirty();
  }
  function handleCourierEvent(event) {
    var _a, _b, _c, _d, _e;
    storage["skyrimRpCourierEvent"] = event;
    if (event.type === "courier_deliveries") {
      log(`courier board count=${event.deliveries.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "courier_delivery_updated") {
      log(`courier ${event.action || "updated"} id=${((_a = event.delivery) == null ? void 0 : _a.id) || "unknown"} status=${((_b = event.delivery) == null ? void 0 : _b.status) || "unknown"}`);
      markMenuDirty();
      return;
    }
    if (event.type === "mail_delivered" || event.type === "courier_delivery_delivered") {
      log(`mail delivered id=${((_c = event.delivery) == null ? void 0 : _c.id) || "unknown"}`);
      markMenuDirty();
      return;
    }
    log(`courier ${event.type.replace("courier_delivery_", "")} id=${((_e = (_d = event.result) == null ? void 0 : _d.delivery) == null ? void 0 : _e.id) || "unknown"}`);
    markMenuDirty();
  }
  function handleLawEvent(event) {
    var _a, _b, _c;
    storage["skyrimRpLawEvent"] = event;
    if (event.type === "wanted_board") {
      log(`wanted board count=${event.wanted.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "crime_report_result" || event.type === "crime_report_filed") {
      log(`crime report ${((_a = event.report) == null ? void 0 : _a.crimeType) || ((_b = event.report) == null ? void 0 : _b.id) || "unknown"} severity=${((_c = event.report) == null ? void 0 : _c.severity) || "unknown"}`);
      markMenuDirty();
      return;
    }
    log(`law ${event.type}`);
    markMenuDirty();
  }
  function handleInjuryEvent(event) {
    var _a, _b;
    storage["skyrimRpInjuryEvent"] = event;
    if (event.type === "medical_calls") {
      log(`medical calls count=${event.injuries.length}`);
      markMenuDirty();
      return;
    }
    log(`injury ${event.type.replace("injury_", "")} id=${((_a = event.injury) == null ? void 0 : _a.id) || "unknown"} status=${((_b = event.injury) == null ? void 0 : _b.status) || "unknown"}`);
    markMenuDirty();
  }
  function handleBusinessEvent(event) {
    var _a, _b, _c;
    storage["skyrimRpBusinessEvent"] = event;
    if (event.type === "business_orders") {
      log(`business orders count=${event.orders.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "business_listings") {
      log(`business listings count=${event.listings.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "business_order_updated") {
      log(`business order ${event.action || "updated"} id=${((_a = event.order) == null ? void 0 : _a.id) || "unknown"} status=${((_b = event.order) == null ? void 0 : _b.status) || "unknown"}`);
      markMenuDirty();
      return;
    }
    if (event.type === "business_listing_updated") {
      log(`business listing ${event.action || "updated"} id=${((_c = event.listing) == null ? void 0 : _c.id) || "unknown"}`);
      markMenuDirty();
      return;
    }
    log(`business ${event.type}`);
    markMenuDirty();
  }
  function handlePropertyEvent(event) {
    var _a;
    storage["skyrimRpPropertyEvent"] = event;
    if (event.type === "property_list") {
      log(`property list count=${event.properties.length}`);
      markMenuDirty();
      return;
    }
    if (event.type === "property_access_result" || event.type === "property_interact_result") {
      log(`property ${event.type.replace("property_", "")} allowed=${event.allowed ? "true" : "false"}`);
      markMenuDirty();
      return;
    }
    log(`property ${event.type.replace("property_", "")} id=${((_a = event.property) == null ? void 0 : _a.id) || "unknown"}`);
    markMenuDirty();
  }
  function handleNpcSpawnEvent(event) {
    storage["skyrimRpNpcSpawnEvent"] = event;
    pendingNpcSpawnEvents.push(event);
    reportNpcSpawnBridgeEvent({
      bridgeEvent: "queued",
      spawnEventType: event.type,
      spawnId: event.type === "snapshot" ? "" : event.spawnId,
      spawnCount: event.type === "snapshot" ? event.spawns.length : 1
    });
    if (event.type === "snapshot") {
      log(`npc snapshot count=${event.spawns.length}`);
      markMenuDirty();
      return;
    }
    log(`npc ${event.type} ${event.spawn.displayName} status=${event.spawn.status}`);
    markMenuDirty();
  }
  function flushNpcSpawnEvents() {
    while (pendingNpcSpawnEvents.length > 0) {
      const event = pendingNpcSpawnEvents.shift();
      if (event) {
        npcSpawnBridge == null ? void 0 : npcSpawnBridge.handleNpcSpawnEvent(event);
      }
    }
  }
  function reportNpcSpawnBridgeEvent(event) {
    void reportClientDiagnostic("npc_spawn_bridge", event).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  function reportPeerAvatarBridgeEvent(event) {
    void reportClientDiagnostic("peer_avatar_bridge", event).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  function reportResourceNodeBridgeEvent(event) {
    void reportClientDiagnostic("resource_node_bridge", event).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  function reportOnboardingRoomBridgeEvent(event) {
    void reportClientDiagnostic("onboarding_room_bridge", event).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  var dxScanCodes = {
    A: 30,
    B: 48,
    C: 46,
    D: 32,
    E: 18,
    F: 33,
    G: 34,
    H: 35,
    I: 23,
    J: 36,
    K: 37,
    L: 38,
    M: 50,
    N: 49,
    O: 24,
    P: 25,
    Q: 16,
    R: 19,
    S: 31,
    T: 20,
    U: 22,
    V: 47,
    W: 17,
    X: 45,
    Y: 21,
    Z: 44,
    Escape: 1,
    Esc: 1,
    Enter: 28,
    Return: 28,
    F1: 59,
    F2: 60,
    F3: 61,
    F4: 62,
    F5: 63,
    F6: 64,
    F7: 65,
    F8: 66,
    F9: 67,
    F10: 68,
    F11: 87,
    F12: 88,
    LeftAlt: 56,
    Spacebar: 57
  };
  function dxScanCodeForKey(key) {
    const normalized = String(key || "").trim();
    if (isUnboundKeyName(normalized)) {
      return null;
    }
    return dxScanCodes[normalized] || dxScanCodes[normalized.toUpperCase()] || null;
  }
  function keyToOptionalDxScanCode(key, fallback = "") {
    const primary = dxScanCodeForKey(key);
    if (primary !== null) {
      return primary;
    }
    if (isUnboundKeyName(key)) {
      return null;
    }
    return dxScanCodeForKey(fallback);
  }
  function keyToDxScanCode(key, fallback = "V") {
    return dxScanCodeForKey(key) || dxScanCodeForKey(fallback) || dxScanCodes.V;
  }
  function isKeyboardButtonEvent(event) {
    const device = Number(event.device);
    return !Number.isFinite(device) || device === 0;
  }
  function normalizeButtonEventCode(event) {
    const code = Number(event.code);
    return Number.isFinite(code) ? Math.trunc(code) : null;
  }
  function updateButtonEventInputState(event, code) {
    const pressed = buttonEventIsPressed(event);
    if (event.isUp || !pressed) {
      pressedButtonEventCodes.delete(code);
      return false;
    }
    pressedButtonEventCodes.add(code);
    return true;
  }
  function buttonEventIsPressed(event) {
    return event.isDown || event.isPressed || event.isHeld || Number(event.value) > 0 && !event.isUp;
  }
  function disabledVanillaControlKeys() {
    return uniqueKeys([
      ...splitKeySetting(disabledVanillaControls || ""),
      ...hardDisabledVanillaControls
    ]);
  }
  function isDisabledVanillaControlCode(code) {
    return disabledVanillaControlKeys().some((key) => code === keyToDxScanCode(key, "T"));
  }
  function isVanillaWaitButtonEvent(event, code) {
    if (!blockVanillaWait) {
      return false;
    }
    if (isDisabledVanillaControlCode(code)) {
      return true;
    }
    const eventName = normalizeActionName(event.userEventName);
    return eventName === "wait" || eventName === "waitmenu" || eventName === "sleepwait";
  }
  function isButtonEventControlPressed(key, fallback) {
    const code = keyToOptionalDxScanCode(key, fallback);
    return code !== null && pressedButtonEventCodes.has(code);
  }
  function isButtonEventAnyControlPressed(keys, fallback) {
    return keys.some((key) => isButtonEventControlPressed(key, fallback));
  }
  function readButtonEventControlPressed(key, fallback, pollingUnavailable = false) {
    return buttonEventInputSeen || pollingUnavailable ? isButtonEventControlPressed(key, fallback) : null;
  }
  function readButtonEventAnyControlPressed(keys, fallback, pollingUnavailable = false) {
    return buttonEventInputSeen || pollingUnavailable ? isButtonEventAnyControlPressed(keys, fallback) : null;
  }
  function codeMatchesKeyList(code, keys, fallback) {
    return keys.some((key) => {
      const keyCode = keyToOptionalDxScanCode(key, fallback);
      return keyCode !== null && code === keyCode;
    });
  }
  function codeMatchesKey(code, key, fallback) {
    const keyCode = keyToOptionalDxScanCode(key, fallback);
    return keyCode !== null && code === keyCode;
  }
  function buttonEventHotkeyName(code) {
    if (blockVanillaWait && isDisabledVanillaControlCode(code)) {
      return "wait";
    }
    if (codeMatchesKey(code, contextMenuHoldKey, "X")) {
      return "context";
    }
    if (codeMatchesKey(code, skillsMenuKey, "K")) {
      return "skills";
    }
    if (codeMatchesKey(code, organizationMenuKey, "H")) {
      return "holdings";
    }
    if (codeMatchesKey(code, guildMenuKey, "G")) {
      return "guilds";
    }
    if (codeMatchesKeyList(code, chatFocusKeys, "Enter")) {
      return "chat";
    }
    if (codeMatchesKey(code, closeOverlayKey, "Escape")) {
      return "close";
    }
    if (debugMenuEnabled && codeMatchesKey(code, rpMenuToggleKey, "F2")) {
      return "debug_toggle";
    }
    if (debugMenuEnabled && codeMatchesKey(code, rpMenuFocusKey, "F6")) {
      return "debug_focus";
    }
    if (codeMatchesKey(code, pushToTalkKey, "V")) {
      return "voice";
    }
    if (resourceGatherKey && codeMatchesKey(code, resourceGatherKey, "G")) {
      return "resource";
    }
    return "";
  }
  function buttonEventRegistrationCodes() {
    const codes = [
      keyToOptionalDxScanCode(contextMenuHoldKey, "X"),
      keyToOptionalDxScanCode(skillsMenuKey, "K"),
      keyToOptionalDxScanCode(organizationMenuKey, "H"),
      keyToOptionalDxScanCode(guildMenuKey, "G"),
      ...chatFocusKeys.map((key) => keyToOptionalDxScanCode(key, "Enter")),
      keyToOptionalDxScanCode(closeOverlayKey, "Escape"),
      keyToOptionalDxScanCode(pushToTalkKey, "V"),
      ...blockVanillaWait ? disabledVanillaControlKeys().map((key) => keyToOptionalDxScanCode(key, "T")) : []
    ].filter((code) => code !== null);
    if (resourceGatherKey) {
      const code = keyToOptionalDxScanCode(resourceGatherKey, "G");
      if (code !== null) {
        codes.push(code);
      }
    }
    if (debugMenuEnabled) {
      const toggleCode = keyToOptionalDxScanCode(rpMenuToggleKey, "F2");
      const focusCode = keyToOptionalDxScanCode(rpMenuFocusKey, "F6");
      if (toggleCode !== null) {
        codes.push(toggleCode);
      }
      if (focusCode !== null) {
        codes.push(focusCode);
      }
    }
    return [...new Set(codes)];
  }
  function registerButtonEventInputs() {
    const codes = buttonEventRegistrationCodes();
    if (!buttonEventRegistrationAttemptDiagnosticSent) {
      buttonEventRegistrationAttemptDiagnosticSent = true;
      void reportClientDiagnostic("button_event_registration_attempt", {
        codes,
        contextMenuHoldKey,
        skillsMenuKey,
        organizationMenuKey,
        guildMenuKey,
        chatFocusKey,
        chatAlternateFocusKey,
        chatFocusKeys,
        pushToTalkKey,
        resourceGatherKey,
        debugMenuEnabled
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
    try {
      const player = Game.getPlayer();
      if (typeof (player == null ? void 0 : player.registerForKey) !== "function") {
        if (!buttonEventRegistrationWarningSent) {
          buttonEventRegistrationWarningSent = true;
          void reportClientDiagnostic("button_event_registration_unavailable", {
            playerAvailable: Boolean(player)
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        return;
      }
      const registered = [];
      for (const code of codes) {
        if (registeredButtonEventCodes.has(code)) {
          continue;
        }
        try {
          player.registerForKey(code);
          registeredButtonEventCodes.add(code);
          registered.push(code);
        } catch (error) {
          if (!buttonEventRegistrationWarningSent) {
            buttonEventRegistrationWarningSent = true;
            void reportClientDiagnostic("button_event_registration_failed", {
              code,
              error: error instanceof Error ? error.message : String(error)
            }).catch((diagnosticError) => {
              log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
            });
          }
        }
      }
      if (registered.length > 0) {
        void reportClientDiagnostic("button_event_registered", {
          codes: registered,
          contextMenuHoldKey,
          skillsMenuKey,
          organizationMenuKey,
          guildMenuKey,
          chatFocusKeys,
          pushToTalkKey,
          resourceGatherKey,
          debugMenuEnabled
        }).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
    } catch (error) {
      if (!buttonEventRegistrationWarningSent) {
        buttonEventRegistrationWarningSent = true;
        void reportClientDiagnostic("button_event_registration_failed", {
          error: error instanceof Error ? error.message : String(error)
        }).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
    }
  }
  function isPushToTalkPressed() {
    const code = keyToOptionalDxScanCode(pushToTalkKey, "V");
    if (code === null) {
      return false;
    }
    const eventPressed = readButtonEventControlPressed(pushToTalkKey, "V", voiceInputPollingUnavailable);
    if (eventPressed !== null) {
      return eventPressed;
    }
    try {
      return Input.isKeyPressed(code);
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        voiceInputPollingUnavailable = true;
        if (!voiceInputContextWarningSent) {
          voiceInputContextWarningSent = true;
          log("push-to-talk input unavailable until a playable cell is loaded");
          void reportClientDiagnostic("voice_input_waiting", {
            error: error instanceof Error ? error.message : String(error),
            stage: "stage1-login-only"
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        return isButtonEventControlPressed(pushToTalkKey, "V");
      }
      throw error;
    }
  }
  function isResourceGatherPressed() {
    if (!resourceGatherKey) {
      return false;
    }
    const code = keyToOptionalDxScanCode(resourceGatherKey, "G");
    if (code === null) {
      return false;
    }
    const eventPressed = readButtonEventControlPressed(resourceGatherKey, "G", resourceInputPollingUnavailable);
    if (eventPressed !== null) {
      return eventPressed;
    }
    try {
      return Input.isKeyPressed(code);
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        resourceInputPollingUnavailable = true;
        if (!resourceInputContextWarningSent) {
          resourceInputContextWarningSent = true;
          log("resource gather input unavailable until a playable cell is loaded");
          void reportClientDiagnostic("resource_input_waiting", {
            error: error instanceof Error ? error.message : String(error),
            stage: "stage1-login-only"
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        return isButtonEventControlPressed(resourceGatherKey, "G");
      }
      throw error;
    }
  }
  function pluginFormLookupIds(formId) {
    return [.../* @__PURE__ */ new Set([
      formId & 1048575,
      formId & 16777215,
      formId
    ])].filter((candidate) => candidate > 0);
  }
  function getConfiguredForm(spec, label2, accepts = () => true, expectedType = "the expected type") {
    const resolved = resolveBaseFormSpec({ baseFormId: spec }, {});
    if (!(resolved == null ? void 0 : resolved.formId)) {
      throw new Error(`${label2} form setting is invalid: ${spec}`);
    }
    const candidates = resolved.pluginName ? pluginFormLookupIds(resolved.formId) : [resolved.formId];
    let foundRejected = false;
    for (const candidate of candidates) {
      const form = resolved.pluginName ? Game.getFormFromFile(candidate, resolved.pluginName) : Game.getFormEx(candidate);
      if (!form) {
        continue;
      }
      if (accepts(form)) {
        return form;
      }
      foundRejected = true;
    }
    const tried = candidates.map((candidate) => normalizeFormId(candidate)).join(", ");
    throw new Error(
      foundRejected ? `${label2} form is not ${expectedType} (tried ${tried})` : `${label2} form was not found (tried ${tried})`
    );
  }
  function readGlobalValue(spec, label2) {
    const form = getConfiguredForm(
      spec,
      label2,
      (candidate) => typeof (candidate == null ? void 0 : candidate.getValue) === "function",
      "a GlobalVariable"
    );
    const value = Number(form.getValue());
    return Number.isFinite(value) ? value : null;
  }
  function disableNativeActivationBridge(message) {
    if (nativeActivationBridgeDisabledReason) {
      return;
    }
    nativeActivationBridgeDisabledReason = message;
    log(`native activation legacy bridge disabled: ${message}`);
    void reportClientDiagnostic("native_activation_bridge_disabled", {
      error: message,
      sequenceGlobal: nativeActivationSequenceGlobal,
      targetGlobal: nativeActivationTargetGlobal,
      eventActivationEnabled: nativeActivationEventEnabled
    }).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
  }
  function pollNativeActivationBridge() {
    if (!nativeActivationBridgeEnabled) {
      return;
    }
    if (nativeActivationBridgeDisabledReason) {
      return;
    }
    if (!nativeActivationSequenceGlobal || !nativeActivationTargetGlobal) {
      if (!nativeActivationMissingConfigReported) {
        nativeActivationMissingConfigReported = true;
        void reportClientDiagnostic("native_activation_bridge_unconfigured", {
          enabled: nativeActivationBridgeEnabled,
          sequenceGlobalConfigured: Boolean(nativeActivationSequenceGlobal),
          targetGlobalConfigured: Boolean(nativeActivationTargetGlobal)
        }).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
      return;
    }
    const nowMs = Date.now();
    if (nowMs - lastNativeActivationPollAt < nativeActivationPollIntervalMs) {
      return;
    }
    lastNativeActivationPollAt = nowMs;
    try {
      const sequence = readGlobalValue(nativeActivationSequenceGlobal, "nativeActivationSequenceGlobal");
      const targetId = readGlobalValue(nativeActivationTargetGlobal, "nativeActivationTargetGlobal");
      if (sequence === null || targetId === null) {
        return;
      }
      if (lastNativeActivationSequence === null) {
        lastNativeActivationSequence = sequence;
        return;
      }
      if (sequence === lastNativeActivationSequence) {
        return;
      }
      lastNativeActivationSequence = sequence;
      const anchorCode = nativeActivationTargetMap[String(Math.trunc(targetId))];
      if (!anchorCode) {
        log(`native activation target ${targetId} is not mapped`);
        void reportClientDiagnostic("native_activation_unmapped", { targetId }).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
        return;
      }
      log(`native activation ${anchorCode}`);
      void reportClientDiagnostic("native_activation", {
        targetId,
        anchorCode,
        sequence
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
      if (!(onboardingRoomBridge == null ? void 0 : onboardingRoomBridge.handleAnchor(anchorCode, "native_activate"))) {
        void (menuController == null ? void 0 : menuController.handleWorldActivation(anchorCode, "native_activate"));
      }
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        if (!nativeActivationContextWarningSent) {
          nativeActivationContextWarningSent = true;
          log("native activation bridge unavailable until a playable cell is loaded");
          void reportClientDiagnostic("native_activation_waiting", {
            error: error instanceof Error ? error.message : String(error)
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        return;
      }
      disableNativeActivationBridge(error instanceof Error ? error.message : String(error));
    }
  }
  function getFormId(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.trunc(value);
    }
    if (typeof value === "string" && value.trim() !== "") {
      const normalized = normalizeFormId(value);
      return normalized ? Number.parseInt(normalized, 16) : null;
    }
    const form = value;
    if (typeof (form == null ? void 0 : form.getFormID) !== "function") {
      return null;
    }
    try {
      const formId = Number(form.getFormID());
      return Number.isFinite(formId) ? Math.trunc(formId) : null;
    } catch (e) {
      return null;
    }
  }
  function getBaseFormId(value) {
    const ref = value;
    try {
      const base = typeof (ref == null ? void 0 : ref.getBaseObject) === "function" ? ref.getBaseObject() : typeof (ref == null ? void 0 : ref.getBase) === "function" ? ref.getBase() : null;
      return getFormId(base);
    } catch (e) {
      return null;
    }
  }
  function firstEventValue(event, keys) {
    if (!event || typeof event !== "object") {
      return null;
    }
    const record = event;
    for (const key of keys) {
      const value = record[key];
      if (value !== void 0 && value !== null) {
        return value;
      }
    }
    return null;
  }
  function isPlayerActivationEvent(event) {
    const actorValue = firstEventValue(event, ["actor", "actionRef", "activatingRef", "source"]);
    const actorId = getFormId(actorValue);
    if (actorId === null) {
      return true;
    }
    const playerId = getReferenceId(Game.getPlayer());
    return playerId === null || actorId === playerId;
  }
  function localFormId(formId) {
    return Math.trunc(formId) & 16777215;
  }
  function getFormType(value) {
    const form = value;
    if (typeof (form == null ? void 0 : form.getType) !== "function") {
      return null;
    }
    try {
      const formType = Number(form.getType());
      return Number.isFinite(formType) ? Math.trunc(formType) : null;
    } catch (e) {
      return null;
    }
  }
  function getBaseObject(value) {
    const ref = value;
    try {
      if (typeof (ref == null ? void 0 : ref.getBaseObject) === "function") {
        return ref.getBaseObject();
      }
      if (typeof (ref == null ? void 0 : ref.getBase) === "function") {
        return ref.getBase();
      }
    } catch (e) {
      return null;
    }
    return null;
  }
  function resolveFormValue(value) {
    if (typeof value !== "number" && typeof value !== "string") {
      return value;
    }
    const formId = getFormId(value);
    if (formId === null) {
      return value;
    }
    try {
      return Game.getFormEx(formId) || Game.getForm(formId) || value;
    } catch (e) {
      return value;
    }
  }
  function vanillaLootBaseDetails(baseValue) {
    const base = resolveFormValue(baseValue);
    const formId = getFormId(base);
    const formType = getFormType(base);
    const name = safeRead(() => {
      const form = base;
      return typeof (form == null ? void 0 : form.getName) === "function" ? form.getName() : "";
    }, "");
    return {
      base,
      formId,
      formType,
      name: settingText(name)
    };
  }
  function shouldBlockVanillaLootBase(baseValue) {
    const details = vanillaLootBaseDetails(baseValue);
    if (details.formId !== null && protectedVanillaLootLocalFormIds.has(localFormId(details.formId))) {
      return false;
    }
    return details.formType !== null && blockedVanillaLootFormTypes.has(details.formType);
  }
  function disableVanillaLootReference(referenceValue) {
    const reference = referenceValue;
    if (typeof (reference == null ? void 0 : reference.disableNoWait) === "function") {
      try {
        reference.disableNoWait(false);
        return true;
      } catch (e) {
      }
    }
    try {
      const objectReference = ObjectReference.from(referenceValue);
      if (objectReference) {
        objectReference.disableNoWait(false);
        return true;
      }
    } catch (e) {
    }
    return false;
  }
  function reportVanillaLootBlocked(source, baseValue, extra = {}) {
    const nowMs = Date.now();
    if (nowMs - lastVanillaLootBlockDiagnosticAt < 2e3) {
      return;
    }
    lastVanillaLootBlockDiagnosticAt = nowMs;
    const details = vanillaLootBaseDetails(baseValue);
    const baseFormId = details.formId === null ? null : normalizeFormId(details.formId);
    const label2 = details.name || baseFormId || "unknown item";
    log(`blocked vanilla loot ${label2}`);
    void reportClientDiagnostic("vanilla_loot_blocked", __spreadValues({
      source,
      baseFormId,
      formType: details.formType,
      name: details.name
    }, extra)).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
  }
  function handleVanillaLootActivation(event) {
    if (!vanillaLootBlockEnabled || !isPlayerActivationEvent(event)) {
      return;
    }
    const refValue = firstEventValue(event, [
      "target",
      "targetRef",
      "targetReference",
      "activatedRef",
      "objectReference",
      "object",
      "ref"
    ]);
    const baseValue = firstEventValue(event, ["baseObj", "baseObject", "baseForm", "targetBase"]) || getBaseObject(refValue);
    if (!shouldBlockVanillaLootBase(baseValue)) {
      return;
    }
    const disabled = disableVanillaLootReference(refValue);
    const refFormId = getFormId(refValue);
    reportVanillaLootBlocked("activate", baseValue, {
      refFormId: refFormId === null ? null : normalizeFormId(refFormId),
      disabled
    });
  }
  function handleVanillaLootContainerChanged(event) {
    var _a, _b, _c;
    if (!vanillaLootBlockEnabled) {
      return;
    }
    const player = Game.getPlayer();
    const playerId = getFormId(player);
    const newContainer = firstEventValue(event, ["newContainer", "akNewContainer", "container", "toContainer"]);
    const newContainerId = getFormId(newContainer);
    if (playerId === null || newContainerId === null || playerId !== newContainerId) {
      return;
    }
    const referenceValue = firstEventValue(event, ["reference", "itemReference", "objectReference", "ref"]);
    const baseValue = firstEventValue(event, ["baseObj", "baseObject", "akBaseObject", "item", "form", "object"]) || getBaseObject(referenceValue);
    if (!shouldBlockVanillaLootBase(baseValue)) {
      return;
    }
    const details = vanillaLootBaseDetails(baseValue);
    const countValue = Number((_c = (_b = (_a = event.numItems) != null ? _a : event.count) != null ? _b : event.itemCount) != null ? _c : 1);
    const requestedCount = Number.isFinite(countValue) ? Math.max(1, Math.trunc(countValue)) : 1;
    const playerCount = player ? safeRead(() => player.getItemCount(details.base), 0) : 0;
    const removeCount = Math.max(1, Math.min(requestedCount, Math.max(0, Math.trunc(playerCount))));
    if (player && removeCount > 0) {
      safeRead(() => player.removeItem(details.base, removeCount, true, null), void 0);
    }
    const disabled = disableVanillaLootReference(referenceValue);
    reportVanillaLootBlocked("container_changed", details.base, {
      count: requestedCount,
      removed: removeCount,
      disabled
    });
  }
  function resolveNativeActivationEventAnchor(event) {
    var _a;
    const refValue = firstEventValue(event, [
      "target",
      "targetRef",
      "targetReference",
      "activatedRef",
      "objectReference",
      "object",
      "ref"
    ]);
    const baseValue = firstEventValue(event, ["baseObj", "baseObject", "baseForm", "targetBase"]);
    const refFormId = getFormId(refValue);
    const baseFormId = (_a = getFormId(baseValue)) != null ? _a : getBaseFormId(refValue);
    const keys = [
      refFormId === null ? "" : `ref:${normalizeFormId(refFormId)}`,
      baseFormId === null ? "" : `base:${normalizeFormId(baseFormId)}`,
      refFormId === null ? "" : `ref-local:${normalizeFormId(refFormId).slice(2)}`,
      baseFormId === null ? "" : `base-local:${normalizeFormId(baseFormId).slice(2)}`,
      refFormId === null ? "" : normalizeFormId(refFormId),
      baseFormId === null ? "" : normalizeFormId(baseFormId),
      refFormId === null ? "" : `local:${normalizeFormId(refFormId).slice(2)}`,
      baseFormId === null ? "" : `local:${normalizeFormId(baseFormId).slice(2)}`
    ].filter(Boolean);
    for (const key of keys) {
      const anchorCode = nativeActivationEventMap[key];
      if (anchorCode) {
        return {
          anchorCode,
          key,
          refFormId: refFormId === null ? null : normalizeFormId(refFormId),
          baseFormId: baseFormId === null ? null : normalizeFormId(baseFormId)
        };
      }
    }
    return null;
  }
  function nativeActivationEventDetails(event) {
    var _a;
    const refValue = firstEventValue(event, [
      "target",
      "targetRef",
      "targetReference",
      "activatedRef",
      "objectReference",
      "object",
      "ref"
    ]);
    const baseValue = firstEventValue(event, ["baseObj", "baseObject", "baseForm", "targetBase"]);
    const refFormId = getFormId(refValue);
    const baseFormId = (_a = getFormId(baseValue)) != null ? _a : getBaseFormId(refValue);
    return {
      refFormId: refFormId === null ? null : normalizeFormId(refFormId),
      baseFormId: baseFormId === null ? null : normalizeFormId(baseFormId),
      eventKeys: event && typeof event === "object" ? Object.keys(event).slice(0, 12).join(",") : ""
    };
  }
  function handleNativeActivationEvent(event) {
    if (!nativeActivationEventEnabled || Object.keys(nativeActivationEventMap).length === 0) {
      return;
    }
    if (!isPlayerActivationEvent(event)) {
      return;
    }
    const match = resolveNativeActivationEventAnchor(event);
    if (!match) {
      if (!nativeActivationEventReportUnmatched) {
        return;
      }
      const nowMs2 = Date.now();
      if (nowMs2 - lastNativeActivationUnmatchedDiagnosticAt > 2e3) {
        lastNativeActivationUnmatchedDiagnosticAt = nowMs2;
        const details = nativeActivationEventDetails(event);
        log(`native E activation unmatched ref=${details.refFormId || "unknown"} base=${details.baseFormId || "unknown"}`);
        void reportClientDiagnostic("native_activation_event_unmatched", details).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
      return;
    }
    const nowMs = Date.now();
    const lastAt = lastNativeActivationEventByAnchor.get(match.anchorCode) || 0;
    if (nowMs - lastAt < nativeActivationEventCooldownMs) {
      return;
    }
    lastNativeActivationEventByAnchor.set(match.anchorCode, nowMs);
    log(`native E activation ${match.anchorCode} key=${match.key}`);
    void reportClientDiagnostic("native_activation_event", {
      anchorCode: match.anchorCode,
      mapKey: match.key,
      refFormId: match.refFormId,
      baseFormId: match.baseFormId
    }).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
    if (!(onboardingRoomBridge == null ? void 0 : onboardingRoomBridge.handleAnchor(match.anchorCode, "native_activate_event"))) {
      void (menuController == null ? void 0 : menuController.handleWorldActivation(match.anchorCode, "native_activate_event"));
    }
  }
  function getReferenceId(reference) {
    const ref = reference;
    return typeof (ref == null ? void 0 : ref.getFormID) === "function" ? ref.getFormID() : null;
  }
  function maybeReportRuntimeStarterAnchorsDisabled(actual, identity) {
    if (!runtimeStarterAnchorAttemptReported && isCurrentStage1WorldPosition(actual)) {
      runtimeStarterAnchorAttemptReported = true;
      void reportClientDiagnostic("runtime_starter_anchors_attempt", __spreadProps(__spreadValues({}, identity), {
        enabled: runtimeStarterAnchorsEnabled,
        playerAvailable: actual.playerAvailable,
        plugin: runtimeStarterAnchorPlugin,
        x: actual.x,
        y: actual.y,
        z: actual.z,
        cell: actual.cell,
        worldspace: actual.worldspace
      })).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
    }
    if (!runtimeStarterAnchorsEnabled || runtimeStarterAnchorsDisabledReason || !actual.playerAvailable) {
      return;
    }
    runtimeStarterAnchorsDisabledReason = "runtime starter anchor placement is disabled; use saved world-plugin references instead";
    log(runtimeStarterAnchorsDisabledReason);
    void reportClientDiagnostic("runtime_starter_anchors_disabled", __spreadProps(__spreadValues({}, identity), {
      enabled: runtimeStarterAnchorsEnabled,
      reason: runtimeStarterAnchorsDisabledReason,
      plugin: runtimeStarterAnchorPlugin
    })).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
    return;
  }
  function skyrimPlatformContextError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("can't be called in this context");
  }
  function resolveBaseForm(spawn) {
    const spec = resolveBaseFormSpec(spawn, npcBaseFormMap);
    if (!(spec == null ? void 0 : spec.formId)) {
      throw new Error(`base form is not mapped: ${spawn.baseFormId || spawn.templateCode || spawn.role || spawn.id}`);
    }
    let form = null;
    try {
      form = spec.pluginName && spec.pluginName.toLowerCase() !== "skyrim.esm" ? Game.getFormFromFile(spec.formId, spec.pluginName) : Game.getFormEx(spec.formId);
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        throw Object.assign(error instanceof Error ? error : new Error(String(error)), { transient: true });
      }
      throw error;
    }
    if (!form) {
      throw new Error(`base form not found: ${spec.pluginName ? `${spec.pluginName}:` : ""}${spec.formId}`);
    }
    return form;
  }
  function createSkyrimPlatformNpcAdapter() {
    return {
      spawnActor(spawn) {
        const player = Game.getPlayer();
        if (!player) {
          throw Object.assign(new Error("player reference is unavailable"), { transient: true });
        }
        const baseForm = resolveBaseForm(spawn);
        const actorBase = ActorBase.from(baseForm);
        const placed = actorBase ? player.placeActorAtMe(actorBase, 0, null) : player.placeAtMe(baseForm, 1, true, false);
        const reference = ObjectReference.from(placed);
        if (!reference) {
          throw new Error(`placeAtMe returned no reference for ${spawn.id}`);
        }
        if (spawn.displayName) {
          reference.setDisplayName(spawn.displayName, true);
        }
        void reference.setPosition(Number(spawn.x || 0), Number(spawn.y || 0), Number(spawn.z || 0)).catch((error) => {
          log(`npc position failed spawnId=${spawn.id}: ${error.message || String(error)}`);
        });
        void reference.setAngle(0, 0, Number(spawn.rotationZ || 0)).catch((error) => {
          log(`npc angle failed spawnId=${spawn.id}: ${error.message || String(error)}`);
        });
        return reference;
      },
      despawnActor(reference) {
        const objectReference = ObjectReference.from(reference);
        if (!objectReference) {
          return;
        }
        objectReference.disableNoWait(false);
        void objectReference.delete().catch((error) => {
          var _a;
          log(`npc delete failed ref=${(_a = getReferenceId(objectReference)) != null ? _a : "unknown"}: ${error.message || String(error)}`);
        });
      },
      getReferenceId,
      referencesEqual(victim, _reference, referenceId) {
        const victimId = getReferenceId(victim);
        return typeof referenceId === "number" && victimId !== null && victimId === referenceId;
      }
    };
  }
  function resolvePeerAvatarBaseForm(avatar) {
    const spec = resolveBaseFormSpec({
      baseFormId: settingText(avatar.baseFormId, peerAvatarBaseFormId)
    }, peerAvatarBaseFormMap);
    if (!(spec == null ? void 0 : spec.formId)) {
      throw new Error(`peer avatar base form is invalid: ${String(avatar.baseFormId || peerAvatarBaseFormId)}`);
    }
    let form = null;
    try {
      form = spec.pluginName && spec.pluginName.toLowerCase() !== "skyrim.esm" ? Game.getFormFromFile(spec.formId, spec.pluginName) : Game.getFormEx(spec.formId);
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        throw Object.assign(error instanceof Error ? error : new Error(String(error)), { transient: true });
      }
      throw error;
    }
    if (!form) {
      throw new Error(`peer avatar base form not found: ${spec.pluginName ? `${spec.pluginName}:` : ""}${spec.formId}`);
    }
    return form;
  }
  function updatePeerAvatarReference(reference, avatar) {
    const objectReference = ObjectReference.from(reference);
    if (!objectReference) {
      throw new Error(`peer avatar reference is unavailable for ${String(avatar.clientId || "unknown")}`);
    }
    const displayName = settingText(avatar.displayName, settingText(avatar.clientId, "RP Player"));
    if (displayName) {
      objectReference.setDisplayName(displayName, true);
    }
    void objectReference.setPosition(
      Number(avatar.x || 0),
      Number(avatar.y || 0),
      Number(avatar.z || 0)
    ).catch((error) => {
      log(`peer avatar position failed clientId=${String(avatar.clientId || "unknown")}: ${error.message || String(error)}`);
    });
    void objectReference.setAngle(0, 0, Number(avatar.rotationZ || 0)).catch((error) => {
      log(`peer avatar angle failed clientId=${String(avatar.clientId || "unknown")}: ${error.message || String(error)}`);
    });
  }
  function createSkyrimPlatformPeerAvatarAdapter() {
    return {
      spawnAvatar(avatar) {
        const player = Game.getPlayer();
        if (!player) {
          throw Object.assign(new Error("player reference is unavailable"), { transient: true });
        }
        const baseForm = resolvePeerAvatarBaseForm(avatar);
        const actorBase = ActorBase.from(baseForm);
        const placed = actorBase ? player.placeActorAtMe(actorBase, 0, null) : player.placeAtMe(baseForm, 1, true, false);
        const reference = ObjectReference.from(placed);
        if (!reference) {
          throw new Error(`placeAtMe returned no peer avatar reference for ${String(avatar.clientId || "unknown")}`);
        }
        updatePeerAvatarReference(reference, avatar);
        return reference;
      },
      updateAvatar(reference, avatar) {
        updatePeerAvatarReference(reference, avatar);
      },
      despawnAvatar(reference, avatar) {
        const objectReference = ObjectReference.from(reference);
        if (!objectReference) {
          return;
        }
        objectReference.disableNoWait(false);
        void objectReference.delete().catch((error) => {
          var _a;
          log(
            `peer avatar delete failed clientId=${String(avatar.clientId || "unknown")} ref=${(_a = getReferenceId(objectReference)) != null ? _a : "unknown"}: ${error.message || String(error)}`
          );
        });
      },
      getReferenceId
    };
  }
  function wrapSkympCustomPacket(message) {
    return {
      t: 1,
      contentJsonDump: JSON.stringify(__spreadValues({
        customPacketType: "skyrimRp"
      }, message && typeof message === "object" ? message : { payload: message }))
    };
  }
  if (peerAvatarEnabled) {
    peerAvatarBridge = createPeerAvatarBridge({
      adapter: createSkyrimPlatformPeerAvatarAdapter(),
      getPosition: getPlayerPosition,
      storage,
      logger: log,
      onBridgeEvent: reportPeerAvatarBridgeEvent,
      canRender: isPlayableWorldLoaded,
      localCellOnly: settingEnabled(pluginSettings.peerAvatarLocalCellOnly, true),
      baseFormId: peerAvatarBaseFormId
    });
  }
  var joinClient = createRpJoinContract({
    config: {
      backendUrl,
      relayHost: pluginSettings.relayHost || "127.0.0.1",
      relayPort: Number(pluginSettings.relayPort || 3118),
      serverId: pluginSettings.serverId || "main",
      accountId: storedAuth.accountId || pluginSettings.accountId || "",
      sessionToken: storedAuth.sessionToken || pluginSettings.sessionToken || "",
      username: pluginSettings.username || "",
      password: pluginSettings.password || "",
      characterId: pluginSettings.characterId || "",
      characterName: pluginSettings.characterName || "RP Test Character",
      queueId: pluginSettings.queueId || "",
      reservationToken: pluginSettings.reservationToken || "",
      reservationExpiresAt: pluginSettings.reservationExpiresAt || "",
      playSessionToken: pluginSettings.playSessionToken || "",
      playSessionExpiresAt: pluginSettings.playSessionExpiresAt || "",
      playSessionMasterKey: pluginSettings.playSessionMasterKey || pluginSettings.serverId || "main",
      skympProfileId: pluginSettings.skympProfileId || "",
      serverMax: Number(pluginSettings.serverMax || 0),
      awaitClientEvents: settingEnabled(pluginSettings.awaitClientEvents, true),
      waitForRelayAccepted: true,
      relayAcceptedFallbackMs: Number(pluginSettings.relayAcceptedFallbackMs || 1500),
      inGameCharacterSelection: settingEnabled(pluginSettings.inGameCharacterSelection, true),
      createPlaySessionInGame: settingEnabled(pluginSettings.createPlaySessionInGame, true),
      displayName: pluginSettings.displayName || pluginSettings.characterName || "RP Test Character",
      transformIntervalMs: Number(pluginSettings.transformIntervalMs || 250)
    },
    http,
    relay: {
      createClient(host, port) {
        mpClientPlugin.createClient(host, port);
      },
      send(message, reliable) {
        mpClientPlugin.send(JSON.stringify(wrapSkympCustomPacket(message)), reliable);
      },
      sendSkyMpLoginPacket(message, reliable) {
        mpClientPlugin.send(JSON.stringify(message), reliable);
      },
      tick(handler) {
        mpClientPlugin.tick(handler);
      }
    },
    getPosition: getPlayerPosition,
    logger: log,
    reportJoinPhase: createJoinPhaseReporter(http),
    onPeerEvent: handlePeerEvent,
    onOwnerSnapshot: handleOwnerSnapshot,
    onNpcSpawnEvent: settingEnabled(pluginSettings.autoNpcSpawns, false) ? handleNpcSpawnEvent : void 0,
    onResourceEvent: handleResourceEvent,
    onChatEvent: handleChatEvent,
    onTradeEvent: handleTradeEvent,
    onCraftEvent: handleCraftEvent,
    onSpellEvent: handleSpellEvent,
    onJobEvent: handleJobEvent,
    onCourierEvent: handleCourierEvent,
    onLawEvent: handleLawEvent,
    onInjuryEvent: handleInjuryEvent,
    onBusinessEvent: handleBusinessEvent,
    onPropertyEvent: handlePropertyEvent,
    onOnboardingEvent: handleOnboardingEvent,
    onRelayPacket: reportRelayPacket
  });
  function sendSkyMpRawCustomPacket(customPacketType, content) {
    mpClientPlugin.send(JSON.stringify({
      t: 1,
      contentJsonDump: JSON.stringify(__spreadValues({
        customPacketType
      }, content))
    }), true);
  }
  function isRaceMenuOpen() {
    return safeRead(() => Ui.isMenuOpen("RaceSex Menu") || Ui.isMenuOpen("RaceSexMenu"), false);
  }
  function currentPlayerCharacterName(fallback = "") {
    const player = safeRead(() => Game.getPlayer(), null);
    const baseObject = safeRead(() => {
      var _a;
      return (_a = player == null ? void 0 : player.getBaseObject) == null ? void 0 : _a.call(player);
    }, null);
    const baseName = safeRead(() => {
      var _a;
      return (_a = baseObject == null ? void 0 : baseObject.getName) == null ? void 0 : _a.call(baseObject);
    }, "");
    const playerName = safeRead(() => {
      var _a;
      return (_a = player == null ? void 0 : player.getName) == null ? void 0 : _a.call(player);
    }, "");
    return settingText(baseName, settingText(playerName, fallback));
  }
  function maybeSendRaceMenuCompletion(source) {
    const raceMenuOpen = isRaceMenuOpen();
    if (raceMenuOpen) {
      raceMenuWasOpen = true;
      return;
    }
    if (raceMenuWasOpen) {
      raceMenuWasOpen = false;
      raceMenuCompletionPending = true;
    }
    if (!raceMenuCompletionPending) {
      return;
    }
    const state = joinClient.getState();
    const identity = getJoinIdentity(state);
    if (state.phase !== "joined" || !identity.characterId) {
      return;
    }
    if (raceMenuCompletionSentForCharacterId === identity.characterId) {
      raceMenuCompletionPending = false;
      return;
    }
    const characterName = currentPlayerCharacterName(identity.characterName);
    const position = isPlayableWorldLoaded() ? getPlayerPosition() : null;
    sendSkyMpRawCustomPacket("skyrimRpRaceMenuComplete", __spreadValues({
      characterId: identity.characterId,
      characterName
    }, position ? { position } : {}));
    raceMenuCompletionSentForCharacterId = identity.characterId;
    raceMenuCompletionPending = false;
    log(`race menu complete sent for ${characterName || identity.characterId}`);
    void reportBrowserStatus("race_menu_complete_sent", {
      source,
      characterId: identity.characterId,
      characterName,
      positionIncluded: Boolean(position)
    }).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  var walletSyncService = createWalletSyncService({
    enabled: walletSyncEnabled,
    intervalMs: walletSyncIntervalMs,
    readGold: createSkyrimGoldReader({ Game }),
    isReady: () => joinClient.getState().phase === "joined" && isPlayableWorldLoaded(),
    syncWalletGold: (gold, options) => joinClient.syncWalletGold(gold, options),
    logger: log,
    reportDiagnostic: reportClientDiagnostic,
    isContextError: skyrimPlatformContextError
  });
  var rpOverviewService = createRpOverviewService({
    http,
    joinClient,
    intervalMs: rpOverviewIntervalMs,
    logger: log,
    reportDiagnostic: reportClientDiagnostic,
    onUpdate: () => markMenuDirty()
  });
  if (onboardingRoomBridgeEnabled) {
    const createOnboardingRoomBridgeUntyped = createOnboardingRoomBridge;
    onboardingRoomBridge = createOnboardingRoomBridgeUntyped({
      getOnboarding: () => {
        var _a;
        const state = joinClient.getState();
        return state.onboarding || ((_a = state.ownerSnapshot) == null ? void 0 : _a.onboarding) || null;
      },
      acknowledgeTip: (tipCode, options = {}) => joinClient.acknowledgeOnboardingTip(tipCode, options),
      approvePortal: (destinationCode, options = {}) => joinClient.requestOnboardingPortal(destinationCode, options),
      loadDestination: loadOnboardingDestination,
      showTip: showOnboardingTip,
      storage,
      logger: log,
      onBridgeEvent: reportOnboardingRoomBridgeEvent
    });
  }
  if (resourceNodeBridgeEnabled) {
    resourceNodeBridge = createResourceNodeBridge({
      getPosition: getPlayerPosition,
      requestResourceNodes: (filters = {}) => joinClient.requestResourceNodes(filters),
      gatherResourceNode: (nodeCode) => joinClient.gatherResourceNode(nodeCode),
      storage,
      logger: log,
      onBridgeEvent: reportResourceNodeBridgeEvent,
      localCellOnly: settingEnabled(pluginSettings.resourceNodeLocalCellOnly, true),
      gatherRadius: resourceGatherRadius,
      requestCooldownMs: resourceNodeRequestCooldownMs
    });
  }
  if (settingEnabled(pluginSettings.autoNpcSpawns, false)) {
    npcSpawnBridge = createNpcSpawnBridge({
      adapter: createSkyrimPlatformNpcAdapter(),
      getPosition: getPlayerPosition,
      reportSpawn: (spawnId, status) => joinClient.reportNpcSpawn(spawnId, status),
      storage,
      logger: log,
      onBridgeEvent: reportNpcSpawnBridgeEvent,
      localCellOnly: settingEnabled(pluginSettings.npcLocalCellOnly, true)
    });
    on("actorKill", (event) => {
      npcSpawnBridge == null ? void 0 : npcSpawnBridge.handleActorKill(event);
    });
  }
  var started = false;
  var startJoinPromise = null;
  var lastAutoJoinAttemptAt = null;
  var tickDiagnosticSent = false;
  var relayPacketDiagnosticCount = 0;
  var starterLoopStarted = false;
  var worldWaitingDiagnosticSent = false;
  var worldLoadedDiagnosticSent = false;
  var voiceInputContextWarningSent = false;
  var resourceInputContextWarningSent = false;
  var rpMenuInputContextWarningSent = false;
  var voiceInputPollingUnavailable = false;
  var resourceInputPollingUnavailable = false;
  var rpMenuInputPollingUnavailable = false;
  var nativeActivationContextWarningSent = false;
  var nativeActivationMissingConfigReported = false;
  var nativeActivationBridgeDisabledReason = "";
  var lastNativeActivationPollAt = 0;
  var lastNativeActivationSequence = null;
  var lastNativeActivationEventByAnchor = /* @__PURE__ */ new Map();
  var contextMenuHoldWasPressed = false;
  var skillsMenuWasPressed = false;
  var organizationMenuWasPressed = false;
  var guildMenuWasPressed = false;
  var chatFocusWasPressed = false;
  var closeOverlayWasPressed = false;
  var rpMenuToggleWasPressed = false;
  var rpMenuFocusWasPressed = false;
  var raceMenuWasOpen = false;
  var raceMenuCompletionPending = false;
  var raceMenuCompletionSentForCharacterId = "";
  function resetRpMenuPressedState() {
    contextMenuHoldWasPressed = false;
    skillsMenuWasPressed = false;
    organizationMenuWasPressed = false;
    guildMenuWasPressed = false;
    chatFocusWasPressed = false;
    closeOverlayWasPressed = false;
    rpMenuToggleWasPressed = false;
    rpMenuFocusWasPressed = false;
  }
  void reportClientDiagnostic("boot", {
    backendUrl,
    relayHost: pluginSettings.relayHost || "127.0.0.1",
    relayPort: Number(pluginSettings.relayPort || 3118),
    autoConnect: settingEnabled(pluginSettings.autoConnect, true),
    stage: "stage1-login-only",
    stage1AutoLoadWorld,
    stage1LoadCell,
    autoShowMenu,
    autoConnectOnMenuReady: settingEnabled(pluginSettings.autoConnectOnMenuReady, false),
    peerAvatarEnabled,
    peerAvatarBaseFormId,
    resourceNodeBridgeEnabled,
    onboardingRoomBridgeEnabled,
    resourceGatherKey,
    resourceGatherRadius,
    contextMenuHoldKey,
    skillsMenuKey,
    organizationMenuKey,
    guildMenuKey,
    disabledVanillaControls: disabledVanillaControlKeys(),
    debugMenuEnabled,
    rpMenuToggleKey,
    rpMenuFocusKey,
    nativeActivationBridgeEnabled,
    nativeActivationBridgeRequested,
    nativeActivationBridgeAllowLegacy,
    nativeActivationSequenceGlobalConfigured: Boolean(nativeActivationSequenceGlobal),
    nativeActivationTargetGlobalConfigured: Boolean(nativeActivationTargetGlobal),
    nativeActivationTargetMap,
    nativeActivationEventEnabled,
    nativeActivationEventMap,
    nativeActivationEventCooldownMs,
    rpOverviewIntervalMs,
    walletReconcileEnabled,
    walletSyncEnabled,
    walletSyncIntervalMs,
    settingsKeys: objectKeys(settings),
    pluginSettingsKeys: objectKeys(pluginSettings)
  }).catch((error) => {
    log(`diagnostic failed: ${error.message || String(error)}`);
  });
  function reportBrowserStatus(label2, details = {}) {
    return reportClientDiagnostic("browser_status", __spreadValues({
      label: label2
    }, details));
  }
  function reportRelayPacket(details) {
    const limit = Number(pluginSettings.relayPacketDiagnosticLimit || 20);
    if (relayPacketDiagnosticCount >= limit) {
      return;
    }
    relayPacketDiagnosticCount += 1;
    void reportClientDiagnostic("relay_packet", __spreadValues({
      sequence: relayPacketDiagnosticCount
    }, details)).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  function withTimeout(promise, timeoutMs, label2) {
    return Promise.race([
      promise,
      new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error(`${label2} timed out after ${timeoutMs}ms`)), timeoutMs);
      })
    ]);
  }
  function startJoin() {
    return __async(this, null, function* () {
      if (started) {
        return;
      }
      if (startJoinPromise) {
        yield startJoinPromise;
        return;
      }
      startJoinPromise = (() => __async(null, null, function* () {
        var _a;
        const state = joinClient.getState();
        void reportBrowserStatus("join_start", {
          phase: state.phase,
          backendUrl,
          relayHost: pluginSettings.relayHost || "127.0.0.1",
          relayPort: Number(pluginSettings.relayPort || 3118),
          serverId: pluginSettings.serverId || "main",
          usernamePresent: Boolean(pluginSettings.username)
        }).catch((error) => {
          log(`diagnostic failed: ${error.message || String(error)}`);
        });
        const result = yield withTimeout(
          joinClient.connect(),
          Number(pluginSettings.joinTimeoutMs || 15e3),
          "join"
        );
        storage["skyrimRpAuth"] = {
          accountId: result.auth.accountId,
          sessionToken: result.auth.sessionToken
        };
        if (!result.character) {
          void reportBrowserStatus("join_character_selection", {
            phase: joinClient.getState().phase,
            availableSlots: Number(((_a = result.characterSlots) == null ? void 0 : _a.availableSlots) || 0)
          }).catch((error) => {
            log(`diagnostic failed: ${error.message || String(error)}`);
          });
          markMenuDirty();
          return;
        }
        started = true;
        void reportBrowserStatus("join_connected", {
          phase: joinClient.getState().phase,
          characterId: result.character.id
        }).catch((error) => {
          log(`diagnostic failed: ${error.message || String(error)}`);
        });
        requestStage1WorldLoad("join_connected");
        markMenuDirty();
      }))();
      try {
        yield startJoinPromise;
      } catch (error) {
        reportJoinFailure(error);
        throw error;
      } finally {
        startJoinPromise = null;
      }
    });
  }
  function reportJoinFailure(error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`join failed: ${message}`);
    const state = joinClient.getState();
    void reportBrowserStatus("join_failed", {
      phase: state.phase,
      error: message
    }).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
    if (!state.auth) {
      void reportClientDiagnostic("preauth_error", {
        phase: state.phase,
        error: message
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
  }
  function shouldAutoConnect() {
    if (!settingEnabled(pluginSettings.autoConnect, true)) {
      return false;
    }
    return !autoShowMenu || settingEnabled(pluginSettings.autoConnectOnMenuReady, false);
  }
  function isRpMenuControlPressed(key, fallback) {
    if (vanillaWaitHotkeysSuppressed()) {
      return false;
    }
    const code = keyToOptionalDxScanCode(key, fallback);
    if (code === null) {
      return false;
    }
    const eventPressed = readButtonEventControlPressed(key, fallback, rpMenuInputPollingUnavailable);
    if (eventPressed !== null) {
      return eventPressed;
    }
    try {
      return Input.isKeyPressed(code);
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        rpMenuInputPollingUnavailable = true;
        if (!rpMenuInputContextWarningSent) {
          rpMenuInputContextWarningSent = true;
          log("RP menu input unavailable until a playable cell is loaded");
          void reportClientDiagnostic("rp_menu_input_waiting", {
            error: error instanceof Error ? error.message : String(error),
            contextMenuHoldKey,
            skillsMenuKey,
            debugMenuEnabled,
            toggleKey: rpMenuToggleKey,
            focusKey: rpMenuFocusKey
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        return isButtonEventControlPressed(key, fallback);
      }
      throw error;
    }
  }
  function isAnyRpMenuControlPressed(keys, fallback) {
    if (vanillaWaitHotkeysSuppressed()) {
      return false;
    }
    const keyCodes = keys.map((key) => keyToOptionalDxScanCode(key, fallback)).filter((code) => code !== null);
    if (keyCodes.length === 0) {
      return false;
    }
    const eventPressed = readButtonEventAnyControlPressed(keys, fallback, rpMenuInputPollingUnavailable);
    if (eventPressed !== null) {
      return eventPressed;
    }
    try {
      return keyCodes.some((code) => Input.isKeyPressed(code));
    } catch (error) {
      if (skyrimPlatformContextError(error)) {
        rpMenuInputPollingUnavailable = true;
        if (!rpMenuInputContextWarningSent) {
          rpMenuInputContextWarningSent = true;
          log("RP menu input unavailable until a playable cell is loaded");
          void reportClientDiagnostic("rp_menu_input_waiting", {
            error: error instanceof Error ? error.message : String(error),
            contextMenuHoldKey,
            skillsMenuKey,
            organizationMenuKey,
            guildMenuKey,
            chatFocusKeys,
            debugMenuEnabled,
            toggleKey: rpMenuToggleKey,
            focusKey: rpMenuFocusKey
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        return isButtonEventAnyControlPressed(keys, fallback);
      }
      throw error;
    }
  }
  function isDisabledVanillaControlPressed() {
    const keys = disabledVanillaControlKeys();
    if (isButtonEventAnyControlPressed(keys, "T")) {
      return true;
    }
    const keyCodes = keys.map((key) => keyToOptionalDxScanCode(key, "T")).filter((code) => code !== null);
    try {
      return keyCodes.some((code) => Input.isKeyPressed(code));
    } catch (e) {
      return false;
    }
  }
  function handleRpMenuHotkeys(source = "poll") {
    if (vanillaWaitHotkeysSuppressed()) {
      resetRpMenuPressedState();
      menuController == null ? void 0 : menuController.setInteractionHeld(false);
      return;
    }
    if (blockVanillaWait && isDisabledVanillaControlPressed()) {
      suppressRpHotkeysForVanillaWait(source, 1e3);
      maybeAssertVanillaWaitPolicy(source, true);
      maybeBlockVanillaWaitMenu(source);
      menuController == null ? void 0 : menuController.setInteractionHeld(false);
      resetRpMenuPressedState();
      return;
    }
    const menuState = readMenuState();
    if (menuState.sleepWaitMenuOpen || menuState.mainMenuOpen || menuState.loadingMenuOpen) {
      if (menuState.sleepWaitMenuOpen) {
        maybeAssertVanillaWaitPolicy(source, true);
        maybeBlockVanillaWaitMenu(source);
      }
      resetRpMenuPressedState();
      return;
    }
    const contextHeld = isRpMenuControlPressed(contextMenuHoldKey, "X");
    if (contextHeld !== contextMenuHoldWasPressed) {
      menuController == null ? void 0 : menuController.setInteractionHeld(contextHeld);
    }
    contextMenuHoldWasPressed = contextHeld;
    const skillsPressed = isRpMenuControlPressed(skillsMenuKey, "K");
    if (skillsPressed && !skillsMenuWasPressed) {
      const open = menuController == null ? void 0 : menuController.toggleSkillsPanel();
      log(`profession HUD ${open ? "shown" : "hidden"}`);
      const nowMs = Date.now();
      if (nowMs - lastSkillsMenuToggleDiagnosticAt > 500) {
        lastSkillsMenuToggleDiagnosticAt = nowMs;
        void reportClientDiagnostic("skills_menu_toggle", {
          key: skillsMenuKey,
          open: Boolean(open),
          inputSource: source,
          phase: joinClient.getState().phase
        }).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
    }
    skillsMenuWasPressed = skillsPressed;
    const organizationPressed = isRpMenuControlPressed(organizationMenuKey, "H");
    if (organizationPressed && !organizationMenuWasPressed) {
      const open = menuController == null ? void 0 : menuController.toggleOrganizationsPanel("holdings");
      log(`holdings HUD ${open ? "shown" : "unavailable"}`);
      void reportClientDiagnostic("organizations_menu_toggle", {
        key: organizationMenuKey,
        mode: "holdings",
        open: Boolean(open),
        inputSource: source,
        phase: joinClient.getState().phase
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
    organizationMenuWasPressed = organizationPressed;
    const guildPressed = isRpMenuControlPressed(guildMenuKey, "G");
    if (guildPressed && !guildMenuWasPressed) {
      const open = menuController == null ? void 0 : menuController.toggleGuildsPanel();
      log(`guild HUD ${open ? "shown" : "unavailable"}`);
      void reportClientDiagnostic("guilds_menu_toggle", {
        key: guildMenuKey,
        mode: "guilds",
        open: Boolean(open),
        inputSource: source,
        phase: joinClient.getState().phase
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
    guildMenuWasPressed = guildPressed;
    const chatPressed = isAnyRpMenuControlPressed(chatFocusKeys, "Enter");
    if (chatPressed && !chatFocusWasPressed) {
      const open = menuController == null ? void 0 : menuController.toggleCommsPanel();
      log(`RP comms ${open ? "focused" : "hidden"}`);
      void reportClientDiagnostic("comms_toggle", {
        key: chatFocusKeys.join(","),
        keys: chatFocusKeys,
        open: Boolean(open),
        inputSource: source,
        phase: joinClient.getState().phase
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
    chatFocusWasPressed = chatPressed;
    const closePressed = isRpMenuControlPressed(closeOverlayKey, "Escape");
    if (closePressed && !closeOverlayWasPressed) {
      menuController == null ? void 0 : menuController.hide();
      log("RP overlay hidden");
      void reportClientDiagnostic("overlay_close", {
        key: closeOverlayKey,
        inputSource: source,
        phase: joinClient.getState().phase
      }).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
    closeOverlayWasPressed = closePressed;
    if (!debugMenuEnabled) {
      rpMenuToggleWasPressed = false;
      rpMenuFocusWasPressed = false;
      return;
    }
    const togglePressed = isRpMenuControlPressed(rpMenuToggleKey, "F2");
    if (togglePressed && !rpMenuToggleWasPressed) {
      const visibleNow = menuController == null ? void 0 : menuController.toggleVisibility();
      log(`RP menu ${visibleNow ? "shown" : "hidden"}`);
    }
    rpMenuToggleWasPressed = togglePressed;
    const focusPressed = isRpMenuControlPressed(rpMenuFocusKey, "F6");
    if (focusPressed && !rpMenuFocusWasPressed) {
      const focused = menuController == null ? void 0 : menuController.toggleMenuFocus();
      log(`RP menu ${focused ? "focused" : "unfocused"}`);
    }
    rpMenuFocusWasPressed = focusPressed;
  }
  function reportButtonEventInput(event, code, pressed, hotkey) {
    const nowMs = Date.now();
    if (buttonEventDiagnosticSent && (!hotkey || nowMs - lastButtonEventHotkeyDiagnosticAt < 500)) {
      return;
    }
    buttonEventDiagnosticSent = true;
    if (hotkey) {
      lastButtonEventHotkeyDiagnosticAt = nowMs;
    }
    void reportClientDiagnostic("button_event_input", {
      code,
      hotkey,
      pressed,
      userEventName: event.userEventName || "",
      isDown: Boolean(event.isDown),
      isUp: Boolean(event.isUp),
      isPressed: Boolean(event.isPressed),
      isHeld: Boolean(event.isHeld),
      isRepeating: Boolean(event.isRepeating),
      playableWorldLoaded: isPlayableWorldLoaded(),
      phase: joinClient.getState().phase
    }).catch((diagnosticError) => {
      log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
    });
  }
  function handleButtonEvent(event) {
    if (!isKeyboardButtonEvent(event)) {
      return;
    }
    const code = normalizeButtonEventCode(event);
    if (code === null) {
      return;
    }
    buttonEventInputSeen = true;
    if (isVanillaWaitButtonEvent(event, code)) {
      const pressed2 = buttonEventIsPressed(event);
      suppressRpHotkeysForVanillaWait("button_event_wait_key", 1e3);
      pressedButtonEventCodes.delete(code);
      resetRpMenuPressedState();
      menuController == null ? void 0 : menuController.setInteractionHeld(false);
      reportButtonEventInput(event, code, pressed2, "wait");
      maybeAssertVanillaWaitPolicy("button_event_wait_key", true);
      maybeBlockVanillaWaitMenu("button_event_wait_key");
      return;
    }
    const pressed = updateButtonEventInputState(event, code);
    const hotkey = buttonEventHotkeyName(code);
    reportButtonEventInput(event, code, pressed, hotkey);
    if (hotkey === "wait") {
      suppressRpHotkeysForVanillaWait("button_event_wait_key", 1e3);
      pressedButtonEventCodes.delete(code);
      resetRpMenuPressedState();
      menuController == null ? void 0 : menuController.setInteractionHeld(false);
      maybeAssertVanillaWaitPolicy("button_event_wait_key", true);
      maybeBlockVanillaWaitMenu("button_event_wait_key");
      return;
    }
    if (!isPlayableWorldLoaded()) {
      if (hotkey === "context") {
        menuController == null ? void 0 : menuController.setInteractionHeld(false);
      }
      return;
    }
    if (["context", "skills", "organizations", "guilds", "chat", "close", "debug_toggle", "debug_focus"].includes(hotkey)) {
      handleRpMenuHotkeys("button_event");
    }
    if (hotkey === "resource" && resourceNodeBridge) {
      resourceNodeBridge.handleGatherInput(isResourceGatherPressed());
    }
    if (hotkey === "voice" && settingEnabled(pluginSettings.autoVoiceState, true)) {
      const pushToTalkPressed = isPushToTalkPressed();
      joinClient.sendVoiceStateIfChanged(pushToTalkPressed, Date.now());
      menuController == null ? void 0 : menuController.setLocalSpeaking(pushToTalkPressed || joinClient.getState().speaking === true);
    }
  }
  function maybeStartAutoJoin(source) {
    if (started || startJoinPromise || !shouldAutoConnect()) {
      return;
    }
    const state = joinClient.getState();
    if (!["idle", "error"].includes(state.phase)) {
      return;
    }
    const now = Date.now();
    if (lastAutoJoinAttemptAt !== null && now - lastAutoJoinAttemptAt < 5e3) {
      return;
    }
    lastAutoJoinAttemptAt = now;
    log(`auto connect source=${source}`);
    void reportBrowserStatus("auto_connect_attempt", {
      source,
      phase: state.phase,
      autoShowMenu,
      autoConnect: settingEnabled(pluginSettings.autoConnect, true),
      autoConnectOnMenuReady: settingEnabled(pluginSettings.autoConnectOnMenuReady, false)
    }).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
    startJoin().catch(() => {
    });
  }
  function maybeRunAutoStarterLoop() {
    if (starterLoopStarted || !settingEnabled(pluginSettings.autoStarterLoopOnJoin, false)) {
      return;
    }
    starterLoopStarted = true;
    log("auto starter loop disabled for Stage 1 login-only launch");
    markMenuDirty();
    void reportBrowserStatus("auto_starter_loop", {
      phase: joinClient.getState().phase,
      disabled: true,
      stage: "stage1-login-only"
    }).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  function requestStage1WorldLoad(source, force = false) {
    if (!force && !stage1AutoLoadWorld || !force && stage1WorldLoadAttempted || pendingStage1WorldLoadSource) {
      return;
    }
    const state = joinClient.getState();
    const identity = getJoinIdentity(state);
    if (force && !isPlayableWorldLoaded()) {
      stage1WorldLoadAttempted = false;
    }
    pendingStage1WorldLoadCommandFallback = null;
    pendingStage1WorldLoadSource = source;
    pendingStage1WorldLoadDueAt = Date.now() + stage1WorldLoadStartDelayMs;
    menuController == null ? void 0 : menuController.setLastAction("Loading world...");
    markMenuDirty();
    void reportClientDiagnostic("world_load_requested", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
      source
    }, identity), {
      cell: stage1LoadCell,
      worldOrCell: formatFormId(stage1LoadWorldOrCell),
      position: stage1LoadPosition,
      angle: stage1LoadAngle,
      startDelayMs: stage1WorldLoadStartDelayMs
    }), readMenuState()), {
      stage: "stage1-login-only"
    })).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
  }
  function runStage1WorldLoadCommandFallback(source, requestedBy, identity, reason) {
    var _a, _b, _c, _d, _e;
    const targetCell = validateConsoleCell(stage1LoadCell);
    const actual = readActualPlayerPosition();
    const menuState = readMenuState();
    if (actual.playerAvailable && actual.cell === targetCell) {
      void reportClientDiagnostic("world_load_skipped", __spreadValues(__spreadProps(__spreadValues({
        source,
        requestedBy
      }, identity), {
        reason: "already_in_target_cell",
        cell: targetCell,
        worldspace: actual.worldspace
      }), menuState)).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
      if (!menuState.mainMenuOpen && !menuState.loadingMenuOpen) {
        menuController == null ? void 0 : menuController.hide();
        return true;
      }
    }
    const command = findConsoleCommand("coc") || findConsoleCommand("CenterOnCell");
    const canExecuteCommand = Boolean(command && typeof command.execute === "function");
    const canCenterOnCell = typeof Debug.centerOnCell === "function";
    const canCenterOnCellAndWait = typeof Debug.centerOnCellAndWait === "function";
    if (!canExecuteCommand && !canCenterOnCell && !canCenterOnCellAndWait) {
      throw new Error("SkyrimPlatform loadGame failed or stalled and no cell-load API is available");
    }
    const commandName = (command == null ? void 0 : command.shortName) || (command == null ? void 0 : command.longName) || "coc";
    const commandNumArgs = (_a = command == null ? void 0 : command.numArgs) != null ? _a : null;
    const plannedMethod = canExecuteCommand ? "ConsoleCommand.execute" : canCenterOnCell ? "Debug.centerOnCell" : "Debug.centerOnCellAndWait";
    log(`stage1 fallback load cell ${targetCell}`);
    menuController == null ? void 0 : menuController.setLastAction("Retrying world load with console command...");
    markMenuDirty();
    void reportClientDiagnostic("world_load_command_start", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
      source,
      requestedBy
    }, identity), {
      cell: targetCell,
      command: commandName,
      method: plannedMethod,
      numArgs: commandNumArgs,
      reason
    }), menuState), {
      stage: "stage1-login-only"
    })).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
    const reportAttemptFailure = (method2, error) => {
      const message = error instanceof Error ? error.message : String(error);
      log(`stage1 ${method2} failed: ${message}`);
      void reportClientDiagnostic("world_load_command_result", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
        source,
        requestedBy
      }, identity), {
        cell: targetCell,
        command: commandName,
        method: method2,
        accepted: false,
        error: message,
        numArgs: commandNumArgs,
        reason
      }), readMenuState()), {
        stage: "stage1-login-only"
      })).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
      return message;
    };
    let accepted = false;
    let method = plannedMethod;
    let lastError = "";
    if (canExecuteCommand) {
      method = "ConsoleCommand.execute";
      try {
        accepted = (command == null ? void 0 : command.execute(0, targetCell)) === true;
        if (!accepted) {
          lastError = reportAttemptFailure(method, `coc ${targetCell} returned false`);
        }
      } catch (error) {
        lastError = reportAttemptFailure(method, error);
      }
    }
    if (!accepted && canCenterOnCell) {
      method = "Debug.centerOnCell";
      try {
        (_c = (_b = Debug).centerOnCell) == null ? void 0 : _c.call(_b, targetCell);
        accepted = true;
      } catch (error) {
        lastError = reportAttemptFailure(method, error);
      }
    }
    if (!accepted && canCenterOnCellAndWait) {
      method = "Debug.centerOnCellAndWait";
      try {
        const resultPromise = (_e = (_d = Debug).centerOnCellAndWait) == null ? void 0 : _e.call(_d, targetCell);
        accepted = true;
        void Promise.resolve(resultPromise).then((result) => {
          void reportClientDiagnostic("world_load_command_result", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
            source,
            requestedBy
          }, identity), {
            cell: targetCell,
            command: commandName,
            method,
            accepted: true,
            result,
            numArgs: commandNumArgs,
            reason
          }), readMenuState()), {
            stage: "stage1-login-only"
          })).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }).catch((error) => {
          reportAttemptFailure(method, error);
        });
      } catch (error) {
        lastError = reportAttemptFailure(method, error);
      }
    }
    void reportClientDiagnostic("world_load_command", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
      source,
      requestedBy
    }, identity), {
      cell: targetCell,
      command: commandName,
      method,
      accepted,
      numArgs: commandNumArgs,
      reason
    }), readMenuState()), {
      stage: "stage1-login-only"
    })).catch((error) => {
      log(`diagnostic failed: ${error.message || String(error)}`);
    });
    if (!accepted) {
      throw new Error(`SkyrimPlatform cell load fallback failed${lastError ? `: ${lastError}` : ""}`);
    }
    menuController == null ? void 0 : menuController.setLastAction("Loading world...");
    markMenuDirty();
    return true;
  }
  function maybeRunStage1WorldLoadCommandFallback(source) {
    const fallback = pendingStage1WorldLoadCommandFallback;
    if (!fallback) {
      return;
    }
    const state = joinClient.getState();
    if (state.phase !== "joined") {
      return;
    }
    if (isPlayableWorldLoaded()) {
      pendingStage1WorldLoadCommandFallback = null;
      return;
    }
    if (Date.now() < fallback.dueAt) {
      return;
    }
    pendingStage1WorldLoadCommandFallback = null;
    const identity = getJoinIdentity(state);
    try {
      log(`direct world load did not finish after ${stage1WorldLoadFallbackMs}ms; trying console fallback`);
      void reportClientDiagnostic("world_load_direct_timeout", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
        source,
        requestedBy: fallback.requestedBy,
        directSource: fallback.directSource
      }, identity), {
        cell: stage1LoadCell,
        fallbackMs: stage1WorldLoadFallbackMs,
        attempts: fallback.attempts,
        reason: fallback.reason
      }), readMenuState()), {
        stage: "stage1-login-only"
      })).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
      runStage1WorldLoadCommandFallback(source, fallback.requestedBy, identity, fallback.reason || "direct_load_timeout");
      if (!isPlayableWorldLoaded() && fallback.attempts < 3) {
        pendingStage1WorldLoadCommandFallback = {
          requestedBy: fallback.requestedBy,
          directSource: fallback.directSource,
          dueAt: Date.now() + stage1WorldLoadFallbackMs,
          attempts: fallback.attempts + 1,
          reason: "command_load_retry"
        };
      } else if (!isPlayableWorldLoaded()) {
        const message = `World load did not finish after ${fallback.attempts} command attempt${fallback.attempts === 1 ? "" : "s"}`;
        log(`stage1 world load fallback exhausted: ${message}`);
        menuController == null ? void 0 : menuController.setLastAction(`World load failed: ${message}`);
        menuController == null ? void 0 : menuController.show(true);
        void reportClientDiagnostic("world_load_failed", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
          source,
          requestedBy: fallback.requestedBy
        }, identity), {
          cell: stage1LoadCell,
          attempts: fallback.attempts,
          reason: "command_attempts_exhausted",
          error: message
        }), readMenuState()), {
          stage: "stage1-login-only"
        })).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`stage1 world load fallback failed: ${message}`);
      menuController == null ? void 0 : menuController.setLastAction(`World load failed: ${message}`);
      menuController == null ? void 0 : menuController.show(true);
      void reportClientDiagnostic("world_load_failed", __spreadProps(__spreadValues({
        source,
        requestedBy: fallback.requestedBy
      }, identity), {
        cell: stage1LoadCell,
        error: message,
        stage: "stage1-login-only"
      })).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
  }
  function maybeExecuteStage1WorldLoad(source) {
    const state = joinClient.getState();
    if (state.phase === "joined" && stage1AutoLoadWorld && !stage1WorldLoadAttempted && !pendingStage1WorldLoadSource && !isPlayableWorldLoaded()) {
      requestStage1WorldLoad(`${source}_joined_observed`);
    }
    maybeRunStage1WorldLoadCommandFallback(source);
    if (!pendingStage1WorldLoadSource || stage1WorldLoadAttempted) {
      return;
    }
    if (state.phase !== "joined") {
      return;
    }
    if (pendingStage1WorldLoadDueAt > Date.now()) {
      return;
    }
    const identity = getJoinIdentity(state);
    stage1WorldLoadAttempted = true;
    const requestedBy = pendingStage1WorldLoadSource;
    pendingStage1WorldLoadSource = null;
    try {
      const targetCell = validateConsoleCell(stage1LoadCell);
      const actual = readActualPlayerPosition();
      const menuState = readMenuState();
      if (actual.playerAvailable && actual.cell === targetCell) {
        void reportClientDiagnostic("world_load_skipped", __spreadValues(__spreadProps(__spreadValues({
          source,
          requestedBy
        }, identity), {
          reason: "already_in_target_cell",
          cell: targetCell,
          worldspace: actual.worldspace
        }), menuState)).catch((error) => {
          log(`diagnostic failed: ${error.message || String(error)}`);
        });
        if (!menuState.mainMenuOpen && !menuState.loadingMenuOpen) {
          menuController == null ? void 0 : menuController.hide();
          return;
        }
      }
      const playerName = identity.characterName || pluginSettings.displayName || pluginSettings.characterName || "Skyrim RP Player";
      log(`stage1 load world ${formatFormId(stage1LoadWorldOrCell)} ${targetCell}`);
      void reportClientDiagnostic("world_load_direct_start", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
        source,
        requestedBy
      }, identity), {
        cell: targetCell,
        worldOrCell: formatFormId(stage1LoadWorldOrCell),
        position: stage1LoadPosition,
        angle: stage1LoadAngle
      }), menuState), {
        stage: "stage1-login-only"
      })).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
      try {
        loadGame(
          [...stage1LoadPosition],
          [...stage1LoadAngle],
          stage1LoadWorldOrCell,
          { name: playerName }
        );
        void reportClientDiagnostic("world_load_direct", __spreadProps(__spreadValues(__spreadProps(__spreadValues({
          source,
          requestedBy
        }, identity), {
          cell: targetCell,
          worldOrCell: formatFormId(stage1LoadWorldOrCell),
          position: stage1LoadPosition,
          angle: stage1LoadAngle
        }), readMenuState()), {
          stage: "stage1-login-only"
        })).catch((error) => {
          log(`diagnostic failed: ${error.message || String(error)}`);
        });
        menuController == null ? void 0 : menuController.setLastAction("Loading world...");
        pendingStage1WorldLoadCommandFallback = {
          requestedBy,
          directSource: source,
          dueAt: Date.now() + stage1WorldLoadFallbackMs,
          attempts: 1,
          reason: "direct_load_timeout"
        };
        markMenuDirty();
        return;
      } catch (error) {
        const directMessage = error instanceof Error ? error.message : String(error);
        log(`direct world load failed: ${directMessage}`);
        void reportClientDiagnostic("world_load_direct_failed", __spreadProps(__spreadValues({
          source,
          requestedBy
        }, identity), {
          cell: targetCell,
          worldOrCell: formatFormId(stage1LoadWorldOrCell),
          error: directMessage,
          stage: "stage1-login-only"
        })).catch((diagnosticError) => {
          log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
        });
      }
      runStage1WorldLoadCommandFallback(source, requestedBy, identity, "direct_load_failed");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log(`stage1 world load failed: ${message}`);
      menuController == null ? void 0 : menuController.setLastAction(`World load failed: ${message}`);
      menuController == null ? void 0 : menuController.show(true);
      void reportClientDiagnostic("world_load_failed", __spreadProps(__spreadValues({
        source,
        requestedBy
      }, identity), {
        cell: stage1LoadCell,
        error: message,
        stage: "stage1-login-only"
      })).catch((diagnosticError) => {
        log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
      });
    }
  }
  function maybeReportPlayableWorld(source) {
    const state = joinClient.getState();
    if (state.phase !== "joined") {
      return;
    }
    const identity = getJoinIdentity(state);
    const actual = readActualPlayerPosition();
    const loaded = isActualStage1WorldPosition(actual);
    const worldspace = displayWorldspace(actual);
    const cell = displayCell(actual);
    const details = __spreadProps(__spreadValues({
      source,
      loaded
    }, identity), {
      playerAvailable: actual.playerAvailable,
      worldspace,
      cell,
      x: actual.x,
      y: actual.y,
      z: actual.z,
      rotationZ: actual.rotationZ,
      targetWorldspace: pluginSettings.worldspace || "",
      targetCell: pluginSettings.cell || ""
    });
    if (loaded) {
      if (worldLoadedDiagnosticSent) {
        return;
      }
      worldLoadedDiagnosticSent = true;
      maybeAssertVanillaWaitPolicy("world_loaded", true);
      maybeAssertFastTravelPolicy("world_loaded", true);
      maybeAssertSurvivalModePolicy("world_loaded", true);
      log(`world loaded ${worldspace}/${cell}`);
      menuController == null ? void 0 : menuController.setLastAction("RP systems online.");
      markMenuDirty();
      maybeReportRuntimeStarterAnchorsDisabled(actual, identity);
      registerButtonEventInputs();
      menuController == null ? void 0 : menuController.hide();
      void reportClientDiagnostic("world_loaded", details).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
      return;
    }
    if (!worldWaitingDiagnosticSent) {
      worldWaitingDiagnosticSent = true;
      log("waiting for playable world load before transform proof");
      markMenuDirty();
      void reportClientDiagnostic("world_waiting", details).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
    }
  }
  function pumpMenuJoin(source) {
    if (source === "tick" && !tickDiagnosticSent) {
      tickDiagnosticSent = true;
      const state2 = joinClient.getState();
      void reportBrowserStatus("tick_seen", {
        phase: state2.phase,
        autoConnect: settingEnabled(pluginSettings.autoConnect, true),
        autoConnectOnMenuReady: settingEnabled(pluginSettings.autoConnectOnMenuReady, false)
      }).catch((error) => {
        log(`diagnostic failed: ${error.message || String(error)}`);
      });
    }
    maybeAssertVanillaWaitPolicy(source);
    maybeBlockVanillaWaitMenu(source);
    maybeAssertFastTravelPolicy(source);
    maybeAssertSurvivalModePolicy(source);
    maybeStartAutoJoin(source);
    joinClient.tick();
    maybeSendRaceMenuCompletion(source);
    maybeRunAutoStarterLoop();
    maybeExecuteStage1WorldLoad(source);
    maybeReportPlayableWorld(source);
    const now = Date.now();
    const state = joinClient.getState();
    rpOverviewService.tick(now);
    if (state.phase === "joined") {
      resourceNodeBridge == null ? void 0 : resourceNodeBridge.tick();
    }
    const playableWorldLoaded = isPlayableWorldLoaded();
    const canPollInput = source === "update" || source === "tick";
    if (playableWorldLoaded) {
      maybeReportRuntimeStarterAnchorsDisabled(readActualPlayerPosition(), getJoinIdentity(state));
      registerButtonEventInputs();
      if (canPollInput) {
        if (!inputPollReadyDiagnosticSent) {
          inputPollReadyDiagnosticSent = true;
          const actual = readActualPlayerPosition();
          void reportClientDiagnostic("input_poll_ready", {
            phase: state.phase,
            skillsMenuKey,
            contextMenuHoldKey,
            buttonEventRegisteredCodes: [...registeredButtonEventCodes],
            nativeActivationEventEnabled,
            nativeActivationBridgeEnabled,
            playerAvailable: actual.playerAvailable,
            worldspace: actual.worldspace,
            cell: actual.cell,
            x: actual.x,
            y: actual.y,
            z: actual.z
          }).catch((diagnosticError) => {
            log(`diagnostic failed: ${diagnosticError.message || String(diagnosticError)}`);
          });
        }
        handleRpMenuHotkeys("poll");
        pollNativeActivationBridge();
      }
      joinClient.sendTransformIfDue(now);
      if (canPollInput) {
        tryApplyPendingWalletReconciliation("update");
        walletSyncService.tick(now);
      }
      if (resourceNodeBridge && resourceGatherKey && canPollInput) {
        resourceNodeBridge.handleGatherInput(isResourceGatherPressed());
      }
      if (worldLoadedDiagnosticSent && canPollInput && settingEnabled(pluginSettings.autoVoiceState, true)) {
        const pushToTalkPressed = isPushToTalkPressed();
        joinClient.sendVoiceStateIfChanged(pushToTalkPressed, now);
        menuController == null ? void 0 : menuController.setLocalSpeaking(pushToTalkPressed || joinClient.getState().speaking === true);
      } else if (canPollInput) {
        menuController == null ? void 0 : menuController.setLocalSpeaking(false);
      }
    } else {
      if (resourceNodeBridge) {
        resourceNodeBridge.handleGatherInput(false);
      }
      menuController == null ? void 0 : menuController.setInteractionHeld(false);
      menuController == null ? void 0 : menuController.setLocalSpeaking(false);
    }
    menuController == null ? void 0 : menuController.tick();
  }
  menuController = createRpMenuController({
    browser,
    http,
    joinClient,
    storage,
    settings: __spreadProps(__spreadValues({}, pluginSettings), {
      autoConnectOnMenuReady: false
    }),
    backendUrl,
    pushToTalkKey,
    chatFocusKey,
    startJoin,
    loadWorld: requestStage1WorldLoad,
    getWorldState: getStage1WorldState,
    reportBrowserStatus,
    getRpOverview: () => rpOverviewService.getOverview(),
    refreshRpOverview: (reason) => rpOverviewService.refresh(reason),
    logger: log
  });
  void reportBrowserStatus("created", { autoShowMenu }).catch((error) => {
    log(`diagnostic failed: ${error.message || String(error)}`);
  });
  void reportClientDiagnostic("gameplay_policy", {
    nativeActivateKey: "E",
    pushToTalk: pushToTalkKey,
    contextMenuHoldKey,
    skillsMenuKey,
    organizationMenuKey,
    guildMenuKey,
    chatFocusKeys,
    debugMenuEnabled,
    rpMenuToggleKey,
    rpMenuFocusKey,
    onboardingRoomBridgeEnabled,
    runtimeStarterAnchorsEnabled,
    runtimeStarterAnchorPlugin,
    disabledVanillaControls,
    blockVanillaWait,
    vanillaWaitAssertIntervalMs,
    fastTravelForceDisabled,
    fastTravelAssertIntervalMs,
    survivalModeForceEnabled,
    survivalModeAssertIntervalMs,
    disableVanillaNpcSpawns,
    vanillaLootBlockEnabled,
    serverAuthoritativeNpcSpawns,
    note: "Vanilla wait/time-skip is guarded as an action with menu-open suppression and wait/sleep time rollback; fast travel is disabled directly without combat state; Survival Mode globals are asserted by the runtime."
  }).catch((error) => {
    log(`diagnostic failed: ${error.message || String(error)}`);
  });
  registerVanillaWaitPolicyEvents();
  registerFastTravelPolicyEvents();
  maybeAssertVanillaWaitPolicy("module_startup", true);
  maybeAssertFastTravelPolicy("module_startup", true);
  maybeAssertSurvivalModePolicy("module_startup", true);
  on("browserMessage", (event) => {
    void (menuController == null ? void 0 : menuController.handleBrowserMessage(event));
  });
  if (autoShowMenu) {
    menuController.show(settingEnabled(pluginSettings.menuFocusOnBoot, true));
    void menuController.refreshServerStatus();
  }
  on("activate", (event) => {
    handleVanillaLootActivation(event);
    handleNativeActivationEvent(event);
  });
  on("containerChanged", (event) => {
    handleVanillaLootContainerChanged(event);
  });
  on("buttonEvent", (event) => {
    handleButtonEvent(event);
  });
  on("tick", () => {
    maybeAssertInitialSurvivalModePolicy("initial_tick");
    pumpMenuJoin("tick");
  });
  on("update", () => {
    maybeAssertInitialSurvivalModePolicy("initial_update");
    pumpMenuJoin("update");
    flushNpcSpawnEvents();
    npcSpawnBridge == null ? void 0 : npcSpawnBridge.tick();
    peerAvatarBridge == null ? void 0 : peerAvatarBridge.tick();
  });
})();
//# sourceMappingURL=skyrim-rp-client.js.map
