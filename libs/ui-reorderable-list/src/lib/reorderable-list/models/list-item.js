import { nanoid } from "nanoid";

/**
 * A model representing our list item.
 *
 * @export
 * @class ListItem
 * @author Ezequiel Sam Ceracas
 * @version 1.1.0
 */
export default class ListItem {
  /**
   * Creates an instance of ListItem.
   * @param {*} props
   * @memberof ListItem
   */
  constructor(props) {
    this._itemIndex = props.itemIndex || 0;
    this._itemData = props.itemData || null;
    this._isEnabled = props.enabled || true;
    this._removeByDragging = props.removeByDragging || false;
    this._instanceID =
      "item-instance-" +
      (props._instanceID ? props._instanceID : nanoid(8));
  }

  /**
   * Returns the instance id for this item.
   *
   * @return {String}
   * @readonly
   * @memberof ListItem
   */
  get instanceID() {
    return this._instanceID;
  }

  /**
   * Returns the data for this item.
   *
   * @return {Object}
   * @readonly
   * @memberof ListItem
   */
  get data() {
    return this._itemData;
  }

  /**
   * Sets the data for this item.
   *
   * @param {Object} value
   * @memberof ListItem
   */
  set data(value) {
    this._itemData = value;
  }

  /**
   * Returns a flag which indicates if an item is enabled/disabled.
   *
   * @return {boolean}
   * @memberof ListItem
   */
  get enabled() {
    return this._isEnabled;
  }

  /**
   * Enables/disables the item.
   *
   * @param {boolean} value
   * @memberof ListItem
   */
  set enabled(value) {
    this._isEnabled = value;
  }

  /**
   * Returns the index for this item on the list.
   *
   * @return {Number}
   * @readonly
   * @memberof ListItem
   */
  get index() {
    return this._itemIndex;
  }

  /**
   * Sets the index for this item on the list.
   *
   * @param {Number} value
   * @memberof ListItem
   */
  set index(value) {
    this._itemIndex = value;
  }
}
