import { nanoid } from "nanoid";
import { get, set } from "../lib/object";
import ListItem from "./list-item";

/**
 * A model representing our list.
 *
 * @export
 * @class List
 * @author Ezequiel Sam Ceracas
 * @version 1.1.0
 */
export default class List {
  /**
   * List constructor
   * @param {object} props
   */
  constructor(props) {
    this._name = props.name || "";
    this._list = props.list || [];
    this._path = props.path || 0;
    this._group = props.group || null;
    this._listItems = null;
    this._groupID = "list-group-" + props.name.replace(/ /g, "-");
    this._instanceID =
      "list-instance-" +
      (props._instanceID ? props._instanceID : nanoid(8));
  }

  /**
   * Returns the list group that this list is part of.
   * For lists without a group, this will return ```null```.
   *
   * @public
   * @readonly
   * @memberof List
   * @return {null|Array}
   */
  get group() {
    return this._group;
  }

  /**
   * Sets the list group that this list is part of.
   *
   * @public
   * @memberof List
   * @param {null|Array} value
   */
  set group(value) {
    this._group = value;
  }

  /**
   * Returns the group id for this list.
   *
   * @public
   * @readonly
   * @memberof List
   * @return {String}
   */
  get groupID() {
    return this._groupID;
  }

  /**
   * Returns the instance id for this reorderable list.
   *
   * @public
   * @readonly
   * @memberof List
   * @return {String}
   */
  get instanceID() {
    return this._instanceID;
  }

  /**
   * Returns the raw array of data found within the list.
   *
   * @public
   * @readonly
   * @memberof List
   * @return {Array}
   */
  get listData() {
    return this._group ? get(this._path, this._group) : this._list;
  }

  /**
   * Sets the new value of the list
   *
   * @public
   * @readonly
   * @param {Array} value
   * @memberof List
   */
  set listData(value) {
    this._group ? set(this._path, this._group, value) : (this._list = value);
    this._listItems = this.listData.map(
      (data, index) =>
        new ListItem({
          itemData: data,
          itemIndex: index
        })
    );
  }

  /**
   * Returns an array of ```ListItem``` contained within the list.
   *
   * @readonly
   * @memberof List
   * @return {Array}
   */
  get listItems() {
    if (!this._listItems) {
      this._listItems = this.listData.map(
        (data, index) =>
          new ListItem({
            itemData: data,
            itemIndex: index
          })
      );
    }
    return this._listItems;
  }

  /**
   * Returns the object path of this list from the list group.
   * Defaults to ```0``` when this list is ungrouped.
   *
   * @public
   * @readonly
   * @memberof List
   * @return {Number}
   */
  get path() {
    return this._path;
  }

  /**
   * Sets the object path of this list from the list group.
   *
   * @public
   * @memberof List
   * @param {number} value
   */
  set path(value) {
    this._path = value;
  }
}
