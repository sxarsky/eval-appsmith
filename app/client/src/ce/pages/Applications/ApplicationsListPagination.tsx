import React from "react";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApplicationsListPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (nextPage: number) => void;
}

/**
 * Pagination controls for the workspace applications list.
 *
 * Renders Prev / Next buttons and the current page indicator. Dispatches
 * the next page number through `onPageChange`; the parent is expected to
 * issue a new fetch with the resolved page argument.
 */
export function ApplicationsListPagination({
  pagination,
  onPageChange,
}: ApplicationsListPaginationProps) {
  const { page, pageSize, total } = pagination;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const prevDisabled = page <= 1;
  const nextDisabled = page >= lastPage;

  return (
    <div
      data-testid="t--applications-pagination"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 0",
      }}
    >
      <button
        aria-label="Previous page"
        data-testid="t--pagination-prev"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        Prev
      </button>

      <span data-testid="t--pagination-page-indicator">
        Page {page} of {lastPage}
      </span>

      <button
        aria-label="Next page"
        data-testid="t--pagination-next"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        Next
      </button>
    </div>
  );
}

export default ApplicationsListPagination;
