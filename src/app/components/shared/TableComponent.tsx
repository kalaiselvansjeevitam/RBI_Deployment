import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
export type Column = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
};
export type DataTableProps = {
  columns: Column[];
  data: any[];
};
interface TableComponentProps extends DataTableProps {
  itemsPerPage?: number;
  onRowClick?: (row: any) => void;
  currentPage?: number; // only for server-side
  totalItems?: number; // only for server-side
  onPageChange?: (page: number) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  columns,
  data,
  itemsPerPage = 10,
  onRowClick,
  currentPage,
  totalItems,
  onPageChange,
}) => {
  const isClientPagination = !onPageChange;

  // For internal client-side pagination
  const [clientPage, setClientPage] = useState(0);

  const activePage = isClientPagination ? clientPage : currentPage || 0;
  const totalCount = isClientPagination ? data.length : totalItems || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const currentItems = isClientPagination
    ? data.slice(activePage * itemsPerPage, (activePage + 1) * itemsPerPage)
    : data;

  const handlePageChange = (page: number) => {
    if (isClientPagination) {
      setClientPage(page);
    } else {
      onPageChange?.(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(0); // first
      let startPage = Math.max(1, activePage - 1);
      let endPage = Math.min(totalPages - 2, activePage + 1);

      if (activePage <= 1) {
        endPage = 3;
      } else if (activePage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      if (startPage > 1) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 2) pageNumbers.push("...");
      pageNumbers.push(totalPages - 1); // last
    }

    return pageNumbers;
  };

  return (
    <div className="p-1 pt-0">
      <div className="shadow-2xl rounded-[20px] overflow-hidden bg-white shadow-2xl shadow-[0_0_20px_rgba(0,0,0,0.12)]">
        <Table className="bg-white p-4 rounded-[20px] rounded-b-[20px] ">
          <TableHeader>
            <TableRow className="font-bold text-sm h-[60px] ">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`font-bold text-sm text-black text-${col.align || "left"} p-3`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white  overflow-scroll">
            {currentItems.length > 0 ? (
              currentItems.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`font-low text-sm text-black h-[64px] ${onRowClick ? "cursor-pointer hover:bg-gray-200" : ""}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`text-${col.align || "left"} p-2`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex">
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      activePage > 0 && handlePageChange(activePage - 1)
                    }
                    className={
                      activePage === 0
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    {pageNumber === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={activePage === pageNumber}
                        onClick={() =>
                          typeof pageNumber === "number" &&
                          handlePageChange(pageNumber)
                        }
                        className={
                          typeof pageNumber === "number" ? "cursor-pointer" : ""
                        }
                      >
                        {(pageNumber as number) + 1}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      activePage < totalPages - 1 &&
                      handlePageChange(activePage + 1)
                    }
                    className={
                      activePage === totalPages - 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableComponent;
