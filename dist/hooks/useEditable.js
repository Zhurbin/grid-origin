"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const types_1 = require("./../types");
const helpers_1 = require("../helpers");
/**
 * Default cell editor
 * @param props
 */
const DefaultEditor = (props) => {
    const { onChange, onSubmit, onCancel, position, cell, nextFocusableCell, value = "", activeCell, autoFocus = true, onKeyDown, ...rest } = props;
    const borderWidth = 2;
    const padding = 10; /* 2 + 1 + 1 + 2 + 2 */
    const textSizer = react_1.useRef(helpers_1.autoSizerCanvas);
    const inputRef = react_1.useRef(null);
    const { x = 0, y = 0, width = 0, height = 0 } = position;
    const getWidth = react_1.useCallback((text) => {
        var _a;
        const textWidth = ((_a = textSizer.current.measureText(text)) === null || _a === void 0 ? void 0 : _a.width) || 0;
        return Math.max(textWidth + padding, width + borderWidth / 2);
    }, [width]);
    react_1.useEffect(() => {
        setInputWidth(getWidth(value));
    }, [value]);
    const [inputWidth, setInputWidth] = react_1.useState(() => getWidth(value));
    react_1.useEffect(() => {
        var _a, _b;
        if (!inputRef.current)
            return;
        if (autoFocus)
            inputRef.current.focus();
        /* Focus cursor at the end */
        inputRef.current.selectionStart = (_b = (_a = helpers_1.castToString(value)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }, []);
    const inputHeight = height;
    return (react_1.default.createElement("div", { style: {
            top: y - borderWidth / 2,
            left: x,
            position: "absolute",
            width: inputWidth,
            height: inputHeight + borderWidth,
            padding: borderWidth,
            boxShadow: "0 2px 6px 2px rgba(60,64,67,.15)",
            border: "2px #1a73e8 solid",
            background: "white",
        } },
        react_1.default.createElement("textarea", Object.assign({ rows: 1, cols: 1, ref: inputRef, value: value, style: {
                font: "12px Arial",
                lineHeight: 1.2,
                width: "100%",
                height: "100%",
                padding: "0 1px",
                margin: 0,
                boxSizing: "border-box",
                borderWidth: 0,
                outline: "none",
                resize: "none",
                overflow: "hidden",
                verticalAlign: "top",
                background: "transparent",
            }, onChange: (e) => {
                onChange === null || onChange === void 0 ? void 0 : onChange(e.target.value, cell);
            }, onKeyDown: (e) => {
                if (!inputRef.current)
                    return;
                const isShiftKey = e.nativeEvent.shiftKey;
                const value = inputRef.current.value;
                // Enter key
                if (e.which === types_1.KeyCodes.Enter) {
                    onSubmit &&
                        onSubmit(value, cell, nextFocusableCell === null || nextFocusableCell === void 0 ? void 0 : nextFocusableCell(cell, isShiftKey ? types_1.Direction.Up : types_1.Direction.Down));
                }
                if (e.which === types_1.KeyCodes.Escape) {
                    onCancel && onCancel(e);
                }
                if (e.which === types_1.KeyCodes.Tab) {
                    e.preventDefault();
                    onSubmit &&
                        onSubmit(value, cell, nextFocusableCell === null || nextFocusableCell === void 0 ? void 0 : nextFocusableCell(cell, isShiftKey ? types_1.Direction.Left : types_1.Direction.Right));
                }
                onKeyDown === null || onKeyDown === void 0 ? void 0 : onKeyDown(e);
            } }, rest))));
};
const getDefaultEditor = (cell) => DefaultEditor;
const defaultCanEdit = (cell) => true;
const defaultIsHidden = (i) => false;
/**
 * Hook to make grid editable
 * @param param
 */
const useEditable = ({ getEditor = getDefaultEditor, gridRef, getValue, onChange, onSubmit, onCancel, onDelete, selections = [], activeCell, canEdit = defaultCanEdit, frozenRows = 0, frozenColumns = 0, hideOnBlur = true, isHiddenRow = defaultIsHidden, isHiddenColumn = defaultIsHidden, rowCount, columnCount, selectionTopBound = 0, selectionBottomBound = rowCount - 1, selectionLeftBound = 0, selectionRightBound = columnCount - 1, editorProps, onBeforeEdit, onKeyDown, }) => {
    const [isEditorShown, setShowEditor] = react_1.useState(false);
    const [value, setValue] = react_1.useState("");
    const [position, setPosition] = react_1.useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const currentActiveCellRef = react_1.useRef(null);
    const initialActiveCell = react_1.useRef();
    const [scrollPosition, setScrollPosition] = react_1.useState({
        scrollLeft: 0,
        scrollTop: 0,
    });
    const [autoFocus, setAutoFocus] = react_1.useState(true);
    const isDirtyRef = react_1.useRef(false);
    const currentValueRef = react_1.useRef(value);
    const initialValueRef = react_1.useRef();
    /* To prevent stale closures data */
    const getValueRef = react_1.useRef(getValue);
    const showEditor = react_1.useCallback(() => setShowEditor(true), []);
    const hideEditor = react_1.useCallback(() => {
        setShowEditor(false);
        currentActiveCellRef.current = null;
    }, []);
    const focusGrid = react_1.useCallback(() => {
        requestAnimationFrame(() => gridRef.current && gridRef.current.focus());
    }, []);
    /* Keep ref in sync */
    react_1.useEffect(() => {
        currentValueRef.current = value;
    });
    /* Keep getvalue ref in sync with upstream prop */
    react_1.useEffect(() => {
        getValueRef.current = getValue;
    }, [getValue]);
    /**
     * Make a cell editable
     * @param coords
     * @param initialValue
     */
    const makeEditable = react_1.useCallback((coords, initialValue, autoFocus = true) => {
        var _a;
        if (!gridRef.current)
            return;
        /* Get actual coords for merged cells */
        coords = gridRef.current.getActualCellCoords(coords);
        /* Check if its the same cell */
        if (helpers_1.isEqualCells(coords, currentActiveCellRef.current))
            return;
        /* Call on before edit */
        if (canEdit(coords)) {
            /* Let user modify coords before edit */
            onBeforeEdit === null || onBeforeEdit === void 0 ? void 0 : onBeforeEdit(coords);
            /*  Focus */
            (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.scrollToItem(coords);
            currentActiveCellRef.current = coords;
            /* Get offsets */
            const pos = gridRef.current.getCellOffsetFromCoords(coords);
            const scrollPosition = gridRef.current.getScrollPosition();
            const cellValue = getValueRef.current(coords);
            const value = initialValue || cellValue || "";
            /**
             * If the user has entered a value in the cell, mark it as dirty
             * So that during mousedown, onSubmit gets called
             */
            isDirtyRef.current = !!initialValue;
            initialValueRef.current = initialValue;
            /* Trigger onChange handlers */
            setValue(value);
            onChange === null || onChange === void 0 ? void 0 : onChange(value, coords);
            setAutoFocus(autoFocus);
            setPosition(getCellPosition(pos, scrollPosition));
            showEditor();
        }
    }, [frozenRows, frozenColumns, onBeforeEdit, canEdit]);
    /**
     * Get current cell position based on scroll position
     * @param position
     * @param scrollPosition
     */
    const getCellPosition = (position, scrollPosition) => {
        var _a, _b;
        if (!currentActiveCellRef.current)
            return { x: 0, y: 0 };
        const isFrozenRow = ((_a = currentActiveCellRef.current) === null || _a === void 0 ? void 0 : _a.rowIndex) < frozenRows;
        const isFrozenColumn = ((_b = currentActiveCellRef.current) === null || _b === void 0 ? void 0 : _b.columnIndex) < frozenColumns;
        return {
            ...position,
            x: position.x -
                (isFrozenColumn ? 0 : scrollPosition.scrollLeft),
            y: position.y - (isFrozenRow ? 0 : scrollPosition.scrollTop),
        };
    };
    /* Activate edit mode */
    const handleDoubleClick = react_1.useCallback((e) => {
        if (!gridRef.current)
            return;
        const coords = gridRef.current.getCellCoordsFromOffset(e.nativeEvent.clientX, e.nativeEvent.clientY);
        if (!coords)
            return;
        const { rowIndex, columnIndex } = coords;
        makeEditable({ rowIndex, columnIndex });
    }, [getValue, frozenRows, frozenColumns]);
    const isSelectionKey = react_1.useCallback((keyCode) => {
        return ([
            types_1.KeyCodes.Right,
            types_1.KeyCodes.Left,
            types_1.KeyCodes.Up,
            types_1.KeyCodes.Down,
            types_1.KeyCodes.Meta,
            types_1.KeyCodes.Escape,
            types_1.KeyCodes.Tab,
            types_1.KeyCodes.Home,
            types_1.KeyCodes.End,
            types_1.KeyCodes.CapsLock,
            types_1.KeyCodes.PageDown,
            types_1.KeyCodes.PageUp,
            types_1.KeyCodes.ScrollLock,
            types_1.KeyCodes.NumLock,
            types_1.KeyCodes.Insert,
            types_1.KeyCodes.Pause,
        ].includes(keyCode) ||
            // Exclude Function keys
            (keyCode >= types_1.KeyCodes.F1 && keyCode <= types_1.KeyCodes.F12));
    }, []);
    const handleKeyDown = react_1.useCallback((e) => {
        const keyCode = e.nativeEvent.keyCode;
        if (keyCode === types_1.KeyCodes.Tab && !initialActiveCell.current) {
            initialActiveCell.current = activeCell;
        }
        if (helpers_1.isArrowKey(keyCode)) {
            initialActiveCell.current = undefined;
        }
        if (isSelectionKey(keyCode) ||
            e.nativeEvent.ctrlKey ||
            (e.nativeEvent.shiftKey &&
                (e.nativeEvent.key === "Shift" ||
                    e.nativeEvent.which === types_1.KeyCodes.SPACE)) ||
            e.nativeEvent.metaKey ||
            e.nativeEvent.which === types_1.KeyCodes.ALT)
            return;
        /* If user has not made any selection yet */
        if (!activeCell)
            return;
        const { rowIndex, columnIndex } = activeCell;
        if (keyCode === types_1.KeyCodes.Delete || keyCode === types_1.KeyCodes.BackSpace) {
            // TODO: onbefore  delete
            onDelete && onDelete(activeCell, selections);
            e.preventDefault();
            return;
        }
        const initialValue = keyCode === types_1.KeyCodes.Enter // Enter key
            ? undefined
            : e.nativeEvent.key;
        makeEditable({ rowIndex, columnIndex }, initialValue);
        /* Prevent the first keystroke */
        e.preventDefault();
    }, [getValue, selections, activeCell]);
    /**
     * Get next focusable cell
     * Respects selection bounds
     */
    const nextFocusableCell = react_1.useCallback((currentCell, direction = types_1.Direction.Right) => {
        var _a, _b, _c, _d, _e;
        /* Next immediate cell */
        const bounds = (_a = gridRef.current) === null || _a === void 0 ? void 0 : _a.getCellBounds(currentCell);
        if (!bounds)
            return null;
        let nextActiveCell;
        switch (direction) {
            case types_1.Direction.Right: {
                let columnIndex = helpers_1.clampIndex(Math.min(bounds.right + 1, selectionRightBound), isHiddenColumn, direction);
                nextActiveCell = {
                    rowIndex: bounds.top,
                    columnIndex,
                };
                break;
            }
            case types_1.Direction.Up:
                let rowIndex = helpers_1.clampIndex(Math.max(bounds.top - 1, selectionTopBound), isHiddenRow, direction);
                nextActiveCell = {
                    rowIndex,
                    columnIndex: bounds.left,
                };
                break;
            case types_1.Direction.Left: {
                let columnIndex = helpers_1.clampIndex(Math.max(bounds.left - 1, selectionLeftBound), isHiddenColumn, direction);
                nextActiveCell = {
                    rowIndex: bounds.top,
                    columnIndex,
                };
                break;
            }
            default: {
                // Down
                let rowIndex = helpers_1.clampIndex(Math.min(((_c = (_b = initialActiveCell.current) === null || _b === void 0 ? void 0 : _b.rowIndex) !== null && _c !== void 0 ? _c : bounds.bottom) + 1, selectionBottomBound), isHiddenRow, direction);
                nextActiveCell = {
                    rowIndex,
                    columnIndex: (_e = (_d = initialActiveCell.current) === null || _d === void 0 ? void 0 : _d.columnIndex) !== null && _e !== void 0 ? _e : bounds.left,
                };
                break;
            }
        }
        if (direction === types_1.Direction.Right && !initialActiveCell.current) {
            initialActiveCell.current = currentCell;
        }
        if (direction === types_1.Direction.Down) {
            /* Move to the next row + cell */
            initialActiveCell.current = undefined;
        }
        /* If user has selected some cells and active cell is within this selection */
        if (selections.length && currentCell && gridRef.current) {
            const { bounds } = selections[selections.length - 1];
            const activeCellBounds = gridRef.current.getCellBounds(currentCell);
            const nextCell = helpers_1.findNextCellWithinBounds(activeCellBounds, bounds, direction);
            if (nextCell)
                nextActiveCell = nextCell;
        }
        return nextActiveCell;
    }, [
        selections,
        isHiddenRow,
        isHiddenColumn,
        selectionBottomBound,
        selectionTopBound,
    ]);
    /* Save the value */
    const handleSubmit = (value, activeCell, nextActiveCell) => {
        /**
         * Hide the editor first, so that we can handle onBlur events
         * 1. Editor hides -> Submit
         * 2. If user clicks outside the grid, onBlur is called, if there is a activeCell, we do another submit
         */
        hideEditor();
        /* Save the new value */
        onSubmit && onSubmit(value, activeCell, nextActiveCell);
        /* Keep the focus */
        focusGrid();
    };
    const handleMouseDown = react_1.useCallback((e) => {
        /* Persistent input, hides only during Enter key or during submit or cancel calls */
        if (!hideOnBlur) {
            return;
        }
        if (currentActiveCellRef.current) {
            if (isDirtyRef.current) {
                handleSubmit(currentValueRef.current, currentActiveCellRef.current);
            }
            else {
                handleCancel();
            }
        }
        initialActiveCell.current = undefined;
    }, [hideOnBlur]);
    const handleChange = react_1.useCallback((newValue, activeCell) => {
        /**
         * Make sure we dont call onChange if initialValue is set
         * This is to accomodate for editor that fire onChange during initialvalue
         * Eg: Slate  <Editor value='' onChange />
         */
        if (initialValueRef.current !== void 0 &&
            initialValueRef.current === newValue) {
            initialValueRef.current = void 0;
            return;
        }
        if (!currentActiveCellRef.current)
            return;
        /* Check if the value has changed. Used to conditionally submit if editor is not in focus */
        isDirtyRef.current = newValue !== value;
        setValue(newValue);
        onChange === null || onChange === void 0 ? void 0 : onChange(newValue, activeCell);
    }, [value]);
    /* When the input is blurred out */
    const handleCancel = (e) => {
        hideEditor();
        onCancel && onCancel(e);
        /* Keep the focus back in the grid */
        focusGrid();
    };
    const handleScroll = react_1.useCallback((scrollPos) => {
        if (!currentActiveCellRef.current)
            return;
        setScrollPosition(scrollPos);
    }, []);
    /* Editor */
    const editingCell = currentActiveCellRef.current;
    const Editor = react_1.useMemo(() => {
        return editingCell
            ? getEditor(editingCell) || getDefaultEditor(editingCell)
            : null;
    }, [editingCell]);
    const handleBlur = react_1.useCallback((e) => {
        if (currentActiveCellRef.current) {
            /* Keep the focus */
            focusGrid();
        }
    }, []);
    const editorComponent = isEditorShown && Editor ? (react_1.default.createElement(Editor, Object.assign({}, editorProps === null || editorProps === void 0 ? void 0 : editorProps(), { 
        /* This is the cell that is currently being edited */
        cell: editingCell, activeCell: activeCell, autoFocus: autoFocus, value: value, selections: selections, onChange: handleChange, onSubmit: handleSubmit, onCancel: handleCancel, position: position, scrollPosition: scrollPosition, nextFocusableCell: nextFocusableCell, onBlur: handleBlur, onKeyDown: onKeyDown }))) : null;
    return {
        editorComponent,
        onDoubleClick: handleDoubleClick,
        onKeyDown: handleKeyDown,
        nextFocusableCell,
        isEditInProgress: !!editingCell,
        editingCell,
        makeEditable,
        setValue: handleChange,
        hideEditor,
        showEditor,
        submitEditor: handleSubmit,
        cancelEditor: handleCancel,
        onMouseDown: handleMouseDown,
        onScroll: handleScroll,
    };
};
exports.default = useEditable;
//# sourceMappingURL=useEditable.js.map