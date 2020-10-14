import sqlite3
from tkinter import *

NAME="objectswithposts.db"

conn = sqlite3.connect(NAME) 
cursor = conn.cursor()
sql = "SELECT * FROM objects WHERE checked=?"
cursor.execute(sql, [(False)]) #prevent injection
notes=cursor.fetchall() # or use fetchone()

def accept_click():
    pass
def reject_click():
    print(f'DEBUG {current_id}')
    #TODO: Test this code!
    """
    sql='DELETE FROM OBJECTS WHERE ID=?'
    cursor.execute(sql,[(current_id)])
    """
    
window = Tk()
window.geometry('750x400')
window.title("Работа с БД")
first_lables_txts=['Имя','Координаты','Тип','Посты']
first_labels=[]
second_lables=[]
entries=[]
current_id=-1
for i in range(4):
    #4 потому что столько данных (тип, заголовок, координаты, посты)
    first_label = Label(window, text=first_lables_txts[i]+': ')
    first_labels.append(first_label)
    first_labels[i].grid(column=0, row=i)

    for j in range(len(notes)):
        current_id=notes[j][0]
        note=notes[j][i+1] #(1, 'abc', '22.1,23.2', 1, '1,2,3', 0), i is 0,1,2,3


    second_label = Label(window, text=note)
    second_lables.append(second_label)
    second_lables[i].grid(column=1, row=i)

    entry = Entry(window,width=10)
    entries.append(entry)
    entries[i].grid(column=2, row=i)

accept_btn = Button(window, text="Одобрить",command=accept_click)
accept_btn.grid(column=0, row=i+2)
reject_btn = Button(window, text="Отклонить",command=reject_click)
reject_btn.grid(column=1, row=i+2)
instruction_lines=["Привет! Слева ты можешь видеть тип значения в базе данных, справа - само значение.\n"] 
#NOTE: don't delete \n!(WTF?)
instruction_lines.append("В поле можно вписать новое значение и оно изменится.\n")
text=Text(width=40, height=5)
text.insert(1.0,instruction_lines[0])
text.insert(2.0,instruction_lines[1])
text.config(state=DISABLED)
text.grid(column=1, row=i+3)
window.mainloop()