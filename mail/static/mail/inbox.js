document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener('submit', send);
  // By default, load the inbox
  load_mailbox('inbox');
});

function view(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#detailed-view').style.display = 'block';

      // ... do something else with email ...
      document.querySelector('#detailed-view').innerHTML = `
      <strong>From: </strong>${email.sender}</br>
      <strong>To: </strong>${email.recipients}</br>
      <strong>Subject: </strong>${email.subject}</br>
      ${email.timestamp}</br>`

      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })

      const replyBtn = document.createElement('button')
      replyBtn.className = "btn btn-outline-info mr-3 mt-3"
      replyBtn.innerHTML = "Reply"
      replyBtn.addEventListener("click", () => {
        compose_email()
        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject
        if (subject.split(' ', 1)[0] != "Re:") {
          subject = "Re: " + email.subject
        }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      })
      document.querySelector('#detailed-view').append(replyBtn);

      const archiveBtn = document.createElement('button')
      archiveBtn.className = email.archived ? "btn btn-outline-primary mr-3 mt-3" : "btn btn-outline-danger mr-3 mt-3"
      archiveBtn.innerHTML = email.archived ? "Unarchive" : "Archive"
      archiveBtn.addEventListener("click", () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
          .then(() => { load_mailbox('archive') })
      })
      document.querySelector('#detailed-view').append(archiveBtn);
      const body = document.createElement('div')
      body.innerHTML = `<hr>${email.body}`
      document.querySelector('#detailed-view').append(body);
    });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detailed-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detailed-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(element => {
        const email = document.createElement('div');
        email.className = "card"
        email.innerHTML = `
        <div class="card-header">
          ${element.subject}
        </div>
        <div class="card-body">
          <h5 class="card-title"><strong>Sender:</strong> ${element.sender}</h5>
          <p class="card-text">${element.timestamp}</p>
        </div>`;
        email.className = element.read ? 'read' : 'unread';
        email.addEventListener('click', function () {
          view(element.id)
        });
        document.querySelector('#emails-view').append(email);

      });
    });

}

function send(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });

}