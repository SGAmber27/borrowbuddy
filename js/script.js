function searchBook() {
  const searchInput = document.getElementById("searchInput").value;
  const resultList = document.getElementById("resultList");

  resultList.innerHTML = "";

  if (searchInput === "") {
    alert("Please enter a book title");
    return;
  }

  resultList.innerHTML = `<li>Found book: ${searchInput}</li>`;
}

function borrowBook() {
  const borrowInput = document.getElementById("borrowInput").value;
  const statusMessage = document.getElementById("statusMessage");

  if (borrowInput === "") {
    alert("Please enter a book title to borrow");
    return;
  }

  statusMessage.innerText = `You have successfully borrowed "${borrowInput}".`;
}

function returnBook() {
  const studentInput = document.getElementById("studentInput").value;

  if (studentInput === "") {
    alert("Student name is required");
    return;
  }

  alert("Book returned successfully");
}
