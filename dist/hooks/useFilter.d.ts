import React from "react";
import { CellInterface, GridRef, AreaProps, AreaStyle } from "./../Grid";
export interface FilterView {
    bounds: AreaProps;
    filters?: Filter;
    style?: AreaStyle;
    title?: string;
}
export declare type Filter = Record<string, FilterDefinition>;
export declare type FilterDefinition<T = React.ReactText> = {
    condition?: FilterConditionDefinition<T>;
    equals?: T[];
    sort?: SortDirection;
};
export declare type FilterOperators = ContainsTextOperators | DataValidationOperator;
export declare type FilterConditionDefinition<T = React.ReactText> = {
    operator?: FilterOperators;
    values?: T[];
};
export declare type SortDirection = "asc" | "desc";
export declare type DataValidationOperator = "isEmpty" | "notIsEmpty" | "between" | "notBetween" | "equal" | "notEqual" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual";
export declare type ContainsTextOperators = "containsText" | "notContainsText" | "containsBlanks" | "notContainsBlanks" | "containsErrors" | "notContainsErrors" | "startsWithText" | "endsWithText" | "equalText";
export interface FilterProps {
    /**
     * Returns filter component
     */
    getFilterComponent?: (cell: CellInterface | null) => React.ElementType | null;
    /**
     * Access grid methods
     */
    gridRef: React.MutableRefObject<GridRef | null>;
    /**
     * Get value of a cell
     */
    getValue: (cell: CellInterface) => any;
    /**
     * Width of the filter panel
     */
    width?: number;
    offset?: number;
    frozenRows?: number;
    frozenColumns?: number;
}
export interface FilterResults {
    /**
     * Component to render filter
     */
    filterComponent: React.ReactNode;
    /**
     * Enable filter
     */
    showFilter: (cell: CellInterface, index: number, filterView: FilterView, filter?: FilterDefinition) => void;
    /**
     * Hide filter component
     */
    hideFilter: () => void;
}
export interface FilterState {
    filterView: FilterView;
    filter?: FilterDefinition;
    index: number;
}
/**
 * Use filter hook
 * @param param0
 */
declare const useFilter: ({ getFilterComponent, gridRef, width, offset, getValue, frozenRows, frozenColumns, }: FilterProps) => FilterResults;
export default useFilter;
