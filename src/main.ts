import {v4 as uuidv4} from 'uuid';



import { defaultKanban, todoList } from "./mock";
import { TodoList } from "./type";

class KanbanApp {
  list: TodoList[]
  constructor(data: TodoList[]) {
    this.list = data;

    this.render()
    this.attachEvent();
  }


  render(){
    const $addListButton = document.createElement('button');
    $addListButton.classList.add('board', 'add');
    $addListButton.innerHTML = `<span class="plub-btn blue"></span>`


    const board = document.querySelector('.todo-container');
    if(board){
      board.innerHTML = ''

      const fragment = document.createDocumentFragment();
      const listElements = this.list.map((list) => this.generateList(list))

      fragment.append(...listElements);
      board.append(fragment, $addListButton)
    }
  }


  attatchEvent() {
    const $addListButton = document.querySelector('.board.add');
    const $removeListButton = document.querySelectorAll('.kanban-delete');
    const $addTodoButton = document.querySelectorAll('.todo-item.add');
    const $removeTodoButton =  document.querySelectorAll('.delete-item');

    $addListButton?.addEventListener('click', () => {
      const newId = uuidv4()
      this.list = [
        ...this.list,
        {
          id: newId,
          title: `kanban-${newId}`,
          list: [],
        },
      ]

      this.render();
    })

    $removeListButton.forEach((button) => {
      button?.addEventListener('click', ({currentTarget}) =>{
        const [, selectedId] = (currentTarget as HTMLButtonElement).id.split('kanban-');
        this.removeList(selectedId);
      })
    })

    $addTodoButton.forEach((button:any) => {
      button.addEventListener('click', ({currentTarget}) => {
        const [,category] = (currentTarget as HTMLButtonElement).id.split('add-todo-',);


        currentTarget.closest('.wrapper').prepend(this.addTodo(category));
        this.addTodo(category);
        this.render();
      })
    })


    $removeTodoButton.forEach((button) => {
      button.addEventListener('click',({currentTarget}) => {
        if(currentTarget && currentTarget instanceof HTMLButtonElement){
          const category = currentTarget?.closest('.todo')?.id.split('+')[0];
          const [,selectedId] = currentTarget.id.split('delete-todo-');

          this.removeTodo(selectedId, category);
        }
      })
    })
  }

  addTodo(category: string){
    const $list = document.createElement('section');
    $list.classList.add('todo');
    $list.setAttribute('id', 'add-item');

    const template = `
    <div class= "todo-item add-item">
      <div>
        <div class="item-header">
          <div class="item-title">
            <span class="item-title-icon"></span>
            <div class="title add-title" contentEditable>제목</div>
          </div>
        </div>
        <div class="todo-content add-content" contentEditable>내용</div>
      </div>
      <div class="todo-control">
        <button class="cancel">Cancel</button>
        <button class="add">Add Item </button>
      </div>
    </div>
    `

    $list.innerHTML = template;

    $list.querySelector('.add')?.addEventListener('click', ({currentTarget}) => {
      const listId = this.list.findIndex(({title}) => title === category);


      if(currentTarget && currentTarget instanceof HTMLButtonElement){
        const $todo = currentTarget.closest('.todo-item');
        const title = $todo?.querySelector('.add-title')?.textContent;
        const body = $todo?.querySelector('.add-content')?.textContent;

        // const newTodoId = this.list[listId]?.list.length > 0 ? uuidv4() : 0;
        const newTodo: Todo = {
          id: uuidv4(),
          content: {
            title: title ?? '',
            body: body ?? '',
          },
          isDone: false,
          category: category,
          tags: [],
        };

        const todos = [...this.list[listId].list, newTodo];
        this.list[listId].list = todos

        this.render();
      }
      
    })
    return $list
  }

  removeTodo(selectedId: string, category: string) {
    const listId = this.list.findIndex((list) => list.title === category);
    const targetList = this.list.find((list) => list.title === category);

    if(targetList) {
      this.list[listId].list = targetList.list.filter((todo) => todo.id !== selectedId)
    }

    this.render();
  }

  removeList(selectedId: string){
    this.list = this.list.filter((list) => list.id  !== selectedId)
    this.render()
  }

  generateList({id, title, list}: TodoList) {

    const $list = document.createElement('section');
    $list.classList.add('board');

    const addButtonElement = `
    <section class="todo">
      <button class="todo-item add" id="add-todo-${title}">
        <span class="plus-btn blue"></span>
      </button>
    </section>
    `
    const listHTML = list?.map(({id: todoId, content, tags}) => {
      return `
      <section class="todo" id="${title} + ${todoId}">
        <div class="todo-item">
            <div class="wrapper">
                <div class="item-header">
                  <div class="item-title">
                    <span class="item-title-icon"></span>
                    <div class="title">${content ? content.title: ''}</div>
                  </div>
                  <div class="todo-control">
                    <button class="delete-item" id="delete-todo-${todoId}">
                      <span class="delete-btn"></span>
                    </button>
                  </div>
                </div>

                <div class="todo-content">${content ? content.body : ''}</div>
            </div>
            <div class="tags">
              ${
                tags &&
                tags.map(({id: tagId, content}) => {
                  return `
                  <span class="tag" id="tag-${todoId}">
                    ${content}
                    <button class="delete-tag delete-btn" id="todo-delete-${tagId}"></button>
                  </span>
                  `
                }).join('')
              }

              <div class="tag add-tag-btn">
                <span contentEditable>태그</span>
                <button class="add-btn" id="todo-${todoId}"></button>
              </div>
            </div>
        </div>
      </section>
      `
    })



    const $item = `
      <section class="board-title">
        <div class="board-header">
          <div class="total"><span id="todo-count"> ${list?.length ?? 0} </span></div>
          <h2 class="title>${title}</h2>
        </div>

        <div class="board-control">
          <button class="kanban-delete" id="kanban-${id}">
            <span class="delete-btn"></span>
          </button>
        </div>
      </section>

      <div class="wrapper">
        ${addButtonElement}
        ${list?.length ? listHTML : ''}
      </div>
    `

    $list.innerHTML = $item;
    return $list;
  }
}

new KanbanApp(defaultKanban);