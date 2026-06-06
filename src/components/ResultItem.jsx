import React from "react";
import { formatDate } from "../utils/formatDate";

const ResultItem = ({ data = [], loading }) => {
  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border" role="status"></div>
        <div className="mt-2">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="container text-center py-4">
        No data available
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">

          {data.map((day, i) => (
            <React.Fragment key={i}>

              {/* VALUES */}
              <div className="row">
                <div className="col mb-2">
                  <div className="h5 bg-info py-2 rounded">
                    {formatDate(day.date)}
                  </div>
                  <div className="container">
                    <div className="row row-cols-8">

                      {Array.from({ length: 8 }).map((_, index) => {
                        const item = day?.values?.[index];

                        return (
                          <div
                            key={index}
                            className="col border border-2 border-dark rounded"
                          >
                            <div className="row d-flex justify-content-center align-items-center border-bottom border-dark border-1">
                              {item?.sum ?? "-"}
                            </div>

                            <div className="row d-flex justify-content-center align-items-center">
                              {item?.number ?? "-"}
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </div>
                </div>
              </div>

            </React.Fragment>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ResultItem;