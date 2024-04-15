import { CSSProperties, ReactElement } from "react";
import { v4 as uuidv4 } from "uuid";
import * as ch from "../../common/channels";
import { ContextOption, Direction } from "../../common/enums";
import { ColumnProps, ContextParams, RowProps, TileProps } from "../../common/interfaces";
import { Column, Row, Tile } from "../src/components/TileApp";
import * as log from "../common/loggerUtil";
import * as pre from "../../common/logPrefixes";

export const tiles: Record<string, TileNode> = {};
export const containers: Record<string, ContainerNode> = {};
const fileName: string = "nodes.tsx";

export class TileTree {
  root: BaseNode;

  constructor(root: BaseNode) {
    this.root = root;
    if (root instanceof TileNode && root.id) {
      tiles[root.id] = root;
    }
  }
}

export abstract class BaseNode {
  parent: BaseNode | null = null;
  abstract toElement(): ReactElement;
  abstract appendStyle(style: React.CSSProperties): void;
}

export abstract class ContainerNode extends BaseNode {
  abstract get children(): BaseNode[];
  abstract set children(value: BaseNode[]);
  abstract get forceState(): React.DispatchWithoutAction;
  abstract set forceState(value: React.DispatchWithoutAction);
  abstract get handlePercents(): number[];
  abstract set handlePercents(value: number[]);
  abstract get style(): React.CSSProperties | undefined;
  abstract set style(value: React.CSSProperties);
  abstract get id(): string;
  abstract set id(value: string);
}

export class TileNode extends BaseNode {
  ref: React.RefObject<HTMLDivElement> | null = null;
  private _props: TileProps;
  private _className?: string;
  private _style?: React.CSSProperties;
  private _id: string;
  private _url?: URL;
  private _contextBehavior: (id: string, params: ContextParams) => void;
  private _resizeBehavior: (id: string, rectangle: Electron.Rectangle) => void;

  constructor(
    {
      className: className,
      style: style,
      id: id = uuidv4(),
      url: url,
      contextBehavior: splitBehavior,
      resizeBehavior: resizeBehavior
    }: TileProps = {
      id: uuidv4(),
      contextBehavior: () => {
        log.info({
          ts: fileName, fn: `${TileNode.name}.constructor`
        }, `${pre.missing}: contextBehavior param`); },
      resizeBehavior: () => { log.info({
        ts: fileName, fn: `${TileNode.name}.constructor`
      }, `${pre.missing}: resizeBehavior param`); }
    },
    parent: ColumnNode | RowNode | null = null
  ) {
    super();
    this.parent = parent;
    this._props = {
      className: className,
      style: style,
      id: id,
      url: url,
      contextBehavior: splitBehavior,
      resizeBehavior: resizeBehavior,
    };
    this._className = className;
    this._style = style;
    this._id = id;
    this._url = url;
    this._contextBehavior = splitBehavior;
    this._resizeBehavior = resizeBehavior;
  }

  toElement(): ReactElement {
    return <Tile
      className={this.className}
      style={this.style}
      id={this.id}
      url={this.url}
      contextBehavior={this._contextBehavior}
      resizeBehavior={this._resizeBehavior}>
    </Tile>;
  }

  getProps(): TileProps { return this._props; }
  setProps(props: TileProps) { this._props = props; }
  appendProps(props: TileProps) { this._props = { ...this._props, ...props }; }
  get className(): string | undefined { return this._className; }
  set className(value: string) {
    this._className = value;
    this.setProps({ ...this._props, className: value });
  }
  get style(): React.CSSProperties | undefined { return this._style; }
  set style(value: React.CSSProperties) {
    this._style = value;
    this.setProps({ ...this._props, style: value });
  }
  appendStyle(style: React.CSSProperties) { this.style = { ...this.style, ...style }; }
  get id(): string { return this._id; }
  set id(value: string) {
    this._id = value;
    this.setProps({ ...this._props, id: value });
  }
  get url(): URL | undefined { return this._url; }
  set url(value: URL) {
    const logOptions = { ts: fileName, fn: `${TileNode.name}.url(set)` };
    this._url = value;
    this.setProps({ ...this._props, url: value });
    log.info(logOptions, `${pre.sendingEvent}: ${ch.setViewUrl} for id "${this.id}"`);
    window.electronAPI.send(ch.setViewUrl, this.id, value.toString());
  }
  split(id: string, direction: Direction) {
    this._contextBehavior(id, { option: ContextOption.Split, direction: direction });
  }
  setContextBehavior(value: (id: string, params: ContextParams) => void) {
    this._contextBehavior = value;
    this.setProps({ ...this._props, contextBehavior: value });
  }
  resize(id: string, rectangle: Electron.Rectangle) { this._resizeBehavior(id, rectangle); }
  setResizeBehavior(value: (id: string, rectangle: Electron.Rectangle) => void) {
    this._resizeBehavior = value;
    this.setProps({ ...this._props, resizeBehavior: value });
  }
}

export class ColumnNode extends ContainerNode {
  private _props: ColumnProps;
  private _children: BaseNode[];
  private _forceState: React.DispatchWithoutAction;
  private _id: string;
  private _handlePercents: number[];
  private _style?: React.CSSProperties;

  constructor({
    children: children,
    refreshRoot: forceState,
    id: id = uuidv4(),
    handlePercents: handlePercents,
    style: style
  }: ColumnProps) {
    super();
    for (const child of children) {
      child.parent = this;
    }
    this._props = {
      children: children,
      refreshRoot: forceState,
      handlePercents: handlePercents,
      style: style,
      id: id
    };
    this._children = children;
    this._forceState = forceState;
    this._handlePercents = handlePercents;
    this._style = style;
    this._id = id;
  }

  toElement(): ReactElement {
    return <Column
      children={this.children}
      refreshRoot={this.forceState}
      handlePercents={this.handlePercents}
      style={this.style}
      id={this.id}
    ></Column>;
  }

  setProps(props: ColumnProps) { this._props = props; }

  get children(): BaseNode[] { return this._children; }
  set children(value: BaseNode[]) {
    this._children = value;
    this.setProps({ ...this._props, children: value });
  }
  get forceState(): React.DispatchWithoutAction { return this._forceState; }
  set forceState(value: React.DispatchWithoutAction) {
    this._forceState = value;
    this.setProps({ ...this._props, refreshRoot: value });
  }
  get handlePercents(): number[] { return this._handlePercents; }
  set handlePercents(value: number[]) {
    this._handlePercents = value;
    this.setProps({ ...this._props, handlePercents: value });
  }
  get style(): React.CSSProperties | undefined { return this._style; }
  set style(value: React.CSSProperties) {
    this._style = value;
    this.setProps({ ...this._props, style: value });
  }
  appendStyle(style: CSSProperties): void { this.style = { ...this.style, ...style }; }
  get id(): string { return this._id; }
  set id(value: string) {
    this._id = value;
    this.setProps({ ...this._props, id: value });
  }
}

export class RowNode extends ContainerNode {
  private _props: RowProps;
  private _children: BaseNode[];
  private _forceState: React.DispatchWithoutAction;
  private _id: string;
  private _handlePercents: number[];
  private _style?: React.CSSProperties;

  constructor({
    children: children,
    refreshRoot: forceState,
    id: id = uuidv4(),
    handlePercents: handlePercents,
    style: style
  }: RowProps) {
    super();
    for (const child of children) {
      child.parent = this;
    }
    this._props = {
      children: children,
      refreshRoot: forceState,
      handlePercents: handlePercents,
      style: style,
      id: id
    };
    this._children = children;
    this._forceState = forceState;
    this._handlePercents = handlePercents;
    this._style = style;
    this._id = id;
  }

  toElement(): ReactElement {
    return <Row
      children={this.children}
      refreshRoot={this.forceState}
      handlePercents={this.handlePercents}
      style={this.style}
      id={this.id}
    ></Row>;
  }

  setProps(props: RowProps) { this._props = props; }

  get children(): BaseNode[] { return this._children; }
  set children(value: BaseNode[]) {
    this._children = value;
    this.setProps({ ...this._props, children: value });
  }
  get forceState(): React.DispatchWithoutAction { return this._forceState; }
  set forceState(value: React.DispatchWithoutAction) {
    this._forceState = value;
    this.setProps({ ...this._props, refreshRoot: value });
  }
  get handlePercents(): number[] { return this._handlePercents; }
  set handlePercents(value: number[]) {
    this._handlePercents = value;
    this.setProps({ ...this._props, handlePercents: value });
  }
  get style(): React.CSSProperties | undefined { return this._style; }
  set style(value: React.CSSProperties) {
    this._style = value;
    this.setProps({ ...this._props, style: value });
  }
  appendStyle(style: CSSProperties): void { this.style = { ...this.style, ...style }; }
  get id(): string { return this._id; }
  set id(value: string) {
    this._id = value;
    this.setProps({ ...this._props, id: value });
  }
}

export function recordTile(tileProps?: TileProps): TileNode {
  let tileNode: TileNode;
  if (tileProps !== undefined) {
    tileNode = new TileNode(tileProps);
  }
  else {
    tileNode = new TileNode();
  }
  tiles[tileNode.id] = tileNode;
  return tileNode;
}

export function recordRow(rowProps: RowProps): RowNode {
  const rowNode: RowNode = new RowNode(rowProps);
  containers[rowNode.id] = rowNode;
  return rowNode;
}

export function recordColumn(columnProps: ColumnProps): ColumnNode {
  const columnNode: ColumnNode = new ColumnNode(columnProps);
  containers[columnNode.id] = columnNode;
  return columnNode;
}