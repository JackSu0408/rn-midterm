// 依照淺色/深色模式提供對應的圖示資源
const ICONS = {
  add: {
    light: require('../img/lightmode/light_add.png'),
    dark: require('../img/darkmode/dark_add.png'),
  },
  addphoto: {
    light: require('../img/lightmode/light_addphoto.png'),
    dark: require('../img/darkmode/dark_addphoto.png'),
  },
  alarm: {
    light: require('../img/lightmode/light_alarm.png'),
    dark: require('../img/darkmode/dark_alarm.png'),
  },
  back: {
    light: require('../img/lightmode/light_back.png'),
    dark: require('../img/darkmode/dark_back.png'),
  },
  bread: {
    light: require('../img/lightmode/light_bread.png'),
    dark: require('../img/darkmode/dark_bread.png'),
  },
  cake: {
    light: require('../img/lightmode/light_cake.png'),
    dark: require('../img/darkmode/dark_cake.png'),
  },
  cookie: {
    light: require('../img/lightmode/light_cookie.png'),
    dark: require('../img/darkmode/dark_cookie.png'),
  },
  delete: {
    light: require('../img/lightmode/light_delete.png'),
    dark: require('../img/darkmode/dark_delete.png'),
  },
  edit: {
    light: require('../img/lightmode/light_edit.png'),
    dark: require('../img/darkmode/dark_edit.png'),
  },
  fav_0: {
    light: require('../img/lightmode/light_fav_0.png'),
    dark: require('../img/darkmode/dark_fav_0.png'),
  },
  share: {
    light: require('../img/lightmode/light_share_0.png'),
    dark: require('../img/darkmode/dark_share_0.png'),
  },
  draft: {
    light: require('../img/lightmode/light_draft.png'),
    dark: require('../img/darkmode/dark_draft.png'),
  },
  favorite: {
    light: require('../img/lightmode/light_favorite.png'),
    dark: require('../img/darkmode/dark_favorite.png'),
  },
  gallery: {
    light: require('../img/lightmode/light_gallery.png'),
    dark: require('../img/darkmode/dark_gallery.png'),
  },
  heat: {
    light: require('../img/lightmode/light_heat.png'),
    dark: require('../img/darkmode/dark_heat.png'),
  },
  home: {
    light: require('../img/lightmode/light_home.png'),
    dark: require('../img/darkmode/dark_home.png'),
  },
  icecream: {
    light: require('../img/lightmode/light_icecream.png'),
    dark: require('../img/darkmode/dark_icecream.png'),
  },
  ingredients: {
    light: require('../img/lightmode/light_ingredients.png'),
    dark: require('../img/darkmode/dark_ingredients.png'),
  },
  label: {
    light: require('../img/lightmode/light_label.png'),
    dark: require('../img/darkmode/dark_label.png'),
  },
  lock: {
    light: require('../img/lightmode/light_lock.png'),
    dark: require('../img/darkmode/dark_lock.png'),
  },
  menu: {
    light: require('../img/lightmode/light_menu.png'),
    dark: require('../img/darkmode/dark_menu.png'),
  },
  method: {
    light: require('../img/lightmode/light_method.png'),
    dark: require('../img/darkmode/dark_method.png'),
  },
  move: {
    light: require('../img/lightmode/light_move.png'),
    dark: require('../img/darkmode/dark_move.png'),
  },
  notification: {
    light: require('../img/lightmode/light_notification.png'),
    dark: require('../img/darkmode/dark_notification.png'),
  },
  profile: {
    light: require('../img/lightmode/light_profile.png'),
    dark: require('../img/darkmode/dark_profile.png'),
  },
  search: {
    light: require('../img/lightmode/light_search.png'),
    dark: require('../img/darkmode/dark_search.png'),
  },
  star: {
    light: require('../img/lightmode/light_star.png'),
    dark: require('../img/darkmode/dark_star.png'),
  },
  switch: {
    light: require('../img/lightmode/light_switch.png'),
    dark: require('../img/darkmode/dark_switch.png'),
  },
};

export const getIcon = (name, mode) => ICONS[name][mode === 'dark' ? 'dark' : 'light'];
