import React from "react";

const PaginationControls = ({
  page,
  totalPages,
  totalRecords,
  limit,
  setPage,
  setLimit,
  pageSizeOptions = [5, 10, 20],
}) => {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <p className="text-sm text-gray-600">
        Page {page} of {totalPages} • {totalRecords} records
      </p>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <select
          className="px-2 py-1 border rounded text-sm"
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
