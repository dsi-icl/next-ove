import React, { Component } from "react";
import PropTypes from "prop-types";
import { get, set } from "../lib/object";
import isEmpty from "is-empty";
import ReOrderableList from "./reorderable-list";

// eslint-disable-next-line valid-jsdoc
/**
 * A wrapper for several interacting ```ReorderableList``` components.
 *
 * @typedef {import("react").ReactElement} ReactElement
 *
 * @class ReOrderableListGroup
 * @author Ezequiel Sam Ceracas
 * @version 1.0.0
 * @extends {Component}
 */
export default class ReOrderableListGroup extends Component {
  static defaultProps = {
    name: "list",
  };

  static propTypes = {
    group: PropTypes.any,
    name: PropTypes.string,
    onListGroupUpdate: PropTypes.func,
    children: PropTypes.node,
  };

  /**
   * List update handler.
   *
   * @param {unknown[]} newList - new list to update
   * @param {string} path - path of item to update
   * @memberof ReOrderableListGroup
   */
  _onListUpdate = (newList, path) => {
    let listCopy = [...this.props.group];
    if (path) {
      set(path, listCopy, newList);
    } else {
      listCopy = newList;
    }
    this.props.onListGroupUpdate?.(listCopy);
  };

  /**
   * Initializes the children. Only detects
   * ```ReorderableList``` components and passes special properties to them.
   *
   * @private
   * @return {Array<ReactElement>}
   * @memberof ReOrderableListGroup
   */
  _initializeChildren() {
    let index = 0;
    return React.Children.map(
      this.props.children,
      child => {
        if (React.isValidElement(/** @type {object} */child) &&
          child.type === ReOrderableList) {
          const props = {
            name: this.props.name,
            list: isEmpty(child.props.list) ?
              get(index.toString(), this.props.group) :
              child.props.list,
            path: isEmpty(child.props.path) ? index : child.props.path,
            onListUpdate: this._onListUpdate,
            group: this.props.group
          };
          index++;
          return React.cloneElement(child, props);
        }
        return child;
      }
    );
  }

  /**
   * Renders the component.
   *
   * @return {ReactElement}
   * @memberof ReOrderableListGroup
   */
  render() {
    return <React.Fragment>{this._initializeChildren()}</React.Fragment>;
  }
}
