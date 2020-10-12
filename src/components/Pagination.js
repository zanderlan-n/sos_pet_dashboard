import React, { useEffect } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

export default function PaginationComponent({
  activePage = 1,
  totalPages,
  onPageChange,
}) {
  const _totalPages = parseInt(Math.ceil(totalPages) || 1, 10);
  const _activePage = parseInt(activePage, 10);

  const from =
    _totalPages <= 5 || _activePage <= 3
      ? 0
      : Math.min(_totalPages - 5, _activePage - 3);

  const showPages =
    _totalPages <= 5 || _activePage <= 3
      ? 5
      : Math.min(_activePage + 2, _totalPages);

  const items = [...new Array(_totalPages)]
    .map((_, i) => i + 1)
    .slice(from, showPages);

  const isOnFirstPage = _activePage === 1;
  const isOnLastPage = _activePage === _totalPages;

  const handlePageChange = (to) => {
    if (to !== _activePage) {
      onPageChange(to);
    }
  };

  return (
    <Pagination>
      <PaginationItem
        disabled={isOnFirstPage}
        onClick={() => !isOnFirstPage && handlePageChange(_activePage - 1)}
        className="ml-auto"
      >
        <PaginationLink tabIndex="-1" previous tag="button" />
      </PaginationItem>
      {items.map((n, i) => (
        <PaginationItem
          key={i}
          onClick={() => handlePageChange(n)}
          active={_activePage === n}
        >
          <PaginationLink
            className={`border-secondary ${
              _activePage === n ? ` bg-secondary` : `bg-light text-dark`
            }`}
            tag="button"
          >
            {n}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem
        disabled={isOnLastPage}
        onClick={() => !isOnLastPage && handlePageChange(_activePage + 1)}
      >
        <PaginationLink className="text-dark" next tag="button" />
      </PaginationItem>
    </Pagination>
  );
}
