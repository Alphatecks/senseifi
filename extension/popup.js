/**
 * SenseiFi Trade Insight – popup script
 * Wire search, filter, and time range to your API when ready.
 */

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.querySelector('.search-input');
  const selectDays = document.querySelector('.select-days');
  const filterBtn = document.querySelector('.btn-icon');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      // TODO: debounce and filter table or refetch from API
    });
  }

  if (selectDays) {
    selectDays.addEventListener('change', function () {
      // TODO: refetch trade insight data for selected range
    });
  }

  if (filterBtn) {
    filterBtn.addEventListener('click', function () {
      // TODO: open filter panel or modal
    });
  }
});
