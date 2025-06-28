module.exports = {
  firebaseDateToJSDate: (firebaseDate) => {
    const milliseconds =
      firebaseDate.seconds * 1000 + firebaseDate.nanoseconds / 1e6;
    return new Date(milliseconds);
  },

  jsDateToFirebaseDate: (jsDate) => {
    const seconds = Math.floor(jsDate.getTime() / 1000);
    const nanoseconds = (jsDate.getTime() % 1000) * 1e6;
    return { seconds, nanoseconds };
  },
};

// 사용 예시
// const firebaseDateExample = { seconds: 1672531199, nanoseconds: 0 };
// const jsDateExample = new Date();

// console.log(firebaseDateToJSDate(firebaseDateExample)); // Date 객체 출력
// console.log(jsDateToFirebaseDate(jsDateExample)); // FirebaseDateObject 출력
