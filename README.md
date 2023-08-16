# Vuex CRUD Module

A flexible and reusable Vuex module for managing CRUD (Create, Read, Update, Delete) operations with ease. This module provides a standardized way to handle API calls, state management, and mutations for various resources in your Vuex store.

## Installation

You can install the `vuex-crud` module using npm or yarn:

```bash
npm install @antoinemairesse/vuex-crud
```

## Usage

To use the `vuex-crud` module, follow these steps:

1. Import required dependencies:

```javascript
import { createStore } from 'vuex';
import { CrudModule, crudActions } from '@antoinemairesse/vuex-crud';
import { ElMessage } from 'element-plus'; // Example notification library
```

2. Define your API descriptor and success callback:

```javascript
const apiDescriptor = (resource, action, data1, data2) => {
  // Define API endpoints and mappings for different actions
};

const onActionSuccess = (action, data, resource) => {
  ElMessage.success(`${resource} ${action}`);
};
```

3. Create your Vuex store with `vuex-crud` modules:

```javascript
export default createStore({
  modules: {
    ...new CrudModule({ resource: 'books', apiDescriptor })
      .setAxios(api)
      .onActionSuccess(onActionSuccess)
      .getModule(),
    // Repeat for other resources as needed
  },
});
```

## API Descriptor

The `apiDescriptor` function defines the API endpoints and data mappings for different CRUD actions. You can customize this function to match your API structure.

## Configuration

The `CrudModule` constructor allows you to configure various options for your CRUD module. These options include:

- `resource`: The name of the resource for CRUD operations.
- `apiDescriptor`: A function that returns API details for actions.

You can further customize the module by using the methods provided by `CrudModule`, such as `setAxios`, `onActionSuccess`, and more.

## License

This project is licensed under the [MIT License](LICENSE).

---

Please make sure to tailor the documentation to accurately represent the features and functionalities of your module. Additionally, update the API descriptor and usage examples with relevant details based on your API structure and application requirements.