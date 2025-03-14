import axios, { AxiosError } from 'axios';

export async function addTodo(failedUrl: string = '') {
  try {
    const data = { title: 'Updated Todo', completed: true, userId: 1 };
    const response = await axios.post(`https://jsonplaceholder.typicode.com/todos${failedUrl}`, data);
    return response.data;
  } catch (error) {
    throw (error as AxiosError).message;
  }
}
