import Head from "next/head";
import MD5 from "../ui/md5";
import React, { useState } from "react";
import NoSSR from "../ui/no";
import { errors } from "../ui/errors";
import { isErrorWithCode } from "../ui/utils";

function ChangePasswordContent() {
  //TODO: add check
  const updatePassword = (e) => setPassword(e.target.value);
  const [password, setPassword] = useState("");
  function check(data) {
    if (isErrorWithCode(data, errors.INVALID_TOKEN)) {
      alert("Произошла ошибка");
    } else alert("Пароль успешно сменен!");
  }
  function send() {
    const opts = {
      method: "POST",
      body: JSON.stringify({ token, password: MD5(password) }),
    };
    fetch("api/changePassword", opts)
      .then((data) => data.json())
      .then((data) => check(data));
  }
  //MAGIC, hahah 6 is 4 (length of hash) + '?' + '='
  const MAGIC = 6;
  const token = location.href.slice(location.href.indexOf("?") + MAGIC);
  console.log(token);
  return (
    <div>
      <p>
        Новый пароль: <input onChange={updatePassword} type="password" />{" "}
      </p>
      <p>
        Пароль еще раз: <input type="password" />{" "}
      </p>
      <button onClick={send}>Отправить</button>
    </div>
  );
}
const ChangePasswordPage = () => {
  return (
    <>
      <Head>
        <title>Неной | Восстановление пароля</title>
      </Head>
      <NoSSR>
        <ChangePasswordContent />
      </NoSSR>
    </>
  );
};

export default ChangePasswordPage;
