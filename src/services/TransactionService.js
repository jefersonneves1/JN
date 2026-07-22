import { StorageService } from './StorageService';

const KEY = 'transactions';

export const TransactionService = {
  list(sort) {
    return StorageService.list(KEY, sort);
  },

  filter(query, sort) {
    let items = StorageService.filter(KEY, query);
    if (sort) {
      const field = sort.replace('-', '');
      const descending = sort.startsWith('-');
      items.sort((a, b) => {
        const av = a[field] || '';
        const bv = b[field] || '';
        return descending
          ? String(bv).localeCompare(String(av))
          : String(av).localeCompare(String(bv));
      });
    }
    return items;
  },

  create(data) {
    return StorageService.create(KEY, data);
  },

  update(id, data) {
    return StorageService.update(KEY, id, data);
  },

  delete(id) {
    return StorageService.delete(KEY, id);
  },

  clearAll() {
    StorageService.clear(KEY);
  },
};