import React from 'react';

import { toast } from 'react-toastify';

export default class FileUpload extends React.PureComponent {
  componentDidMount() {
    document.getElementById(this.props.id).onchange = (e) => {
      const reader = new FileReader();
      const file = e.target.files[0];

      if (this.props.type === 'settings') {
        reader.readAsText(file, 'UTF-8');
      } else {
        // background upload
        if (file.size > 2000000) {
          return toast(window.language.modals.main.file_upload_error);
        }

        reader.readAsDataURL(file);
      }

      reader.addEventListener('load', (e) => {
        this.props.loadFunction(e);
      });
    };
  }

  render() {
    return <input id={this.props.id} type='file' style={{ display: 'none' }} accept={this.props.accept} />;
  }
}
