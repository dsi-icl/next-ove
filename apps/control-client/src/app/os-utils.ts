const IS_OS_FREE_BSD = false; // TODO: check OS version
const IS_OS_LINUX = false; // TODO: check OS version
const IS_OS_MAC = false; // TODO: check OS version
const IS_OS_MAC_OSX = false; // TODO: check OS version
const IS_OS_NET_BSD = false; // TODO: check OS version
const IS_OS_OPEN_BSD = false; // TODO: check OS version
const IS_OS_UNIX = false; // TODO: check OS version
const IS_OS_SUN_OS = false; // TODO: check OS version
const IS_OS_HP_UX = false; // TODO: check OS version
const IS_OS_SOLARIS = false; // TODO: check OS version
const IS_LINUX_LIKE = IS_OS_FREE_BSD || IS_OS_LINUX || IS_OS_MAC || IS_OS_MAC_OSX || IS_OS_NET_BSD || IS_OS_OPEN_BSD || IS_OS_UNIX || IS_OS_HP_UX || IS_OS_SOLARIS || IS_OS_SUN_OS;
const IS_OS_WINDOWS = false; // TODO: check OS version

export {
  IS_OS_HP_UX,
  IS_OS_SOLARIS,
  IS_LINUX_LIKE,
  IS_OS_WINDOWS
}
