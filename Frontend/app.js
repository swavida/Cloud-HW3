function searchPhotos() {
    const query = document.getElementById('searchQuery').value;
    const resultDiv = document.getElementById('searchResults');

    // Clear previous results
    resultDiv.innerHTML = '';

    // Assuming 'apigClient' is from the AWS API Gateway-generated SDK
    const apigClient = apigClientFactory.newClient({
        apiKey: 'heskfhI7P9ad9Ng2zdKsA7V8W3oajlKHaDZuazG9'
    });
    const params = {
        q: query // This is how you pass query parameters
    };

    apigClient.searchGet(params, {}, {})
        .then(function (response) {
            // Success handling
            const photos = response.data.results;
            photos.forEach(photo => {
                const imgElement = document.createElement('img');
                imgElement.src = photo.url;
                imgElement.style.width = '100px';
                resultDiv.appendChild(imgElement);
            });
        }).catch(function (error) {
            // Error handling
            console.error('Search failed:', error);
            resultDiv.innerHTML = 'Search failed. See console for details.';
        });
}

function uploadPhoto() {
    const photoFile = document.getElementById('photoUpload').files[0];
    const customLabels = document.getElementById('customLabels').value;
    // const headers = {
    //     'Content-Type': image/jpg,//photoFile.type,
    //     'x-amz-meta-customLabels': customLabels,
    //     'x-api-key': 'heskfhI7P9ad9Ng2zdKsA7V8W3oajlKHaDZuazG9'
    // };

    const reader = new FileReader();
    reader.readAsArrayBuffer(photoFile);
    
    //new
    const arrayBuffer = reader.result;
    const blob = new Blob([arrayBuffer], { type: photoFile.type });
    const formData = new FormData();
    formData.append('file', blob, photoFile.name);

    const url = 'https://buwufxrcod.execute-api.us-east-1.amazonaws.com/dev/upload/' + encodeURIComponent(photoFile.name);

    const config = {
        headers: {
            'Content-Type': 'image/jpg',
            'x-amz-meta-customLabels': customLabels,
            'x-api-key': 'heskfhI7P9ad9Ng2zdKsA7V8W3oajlKHaDZuazG9'
        }
    };

    axios.put(url, formData, config)
        .then(response => {
            alert('Upload successful!');
        })
        .catch(error => {
            console.error('Upload failed:', error);
            alert('Upload failed. See console for details.');
        });
    //
    // reader.onload = function () {
    //     const arrayBuffer = reader.result;
    //     //const base64Data = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    //     const apigClient = apigClientFactory.newClient();
    //     const additionalParams = {
    //         headers: headers
    //     };

    //     // Example assumes your API client expects an object key to be part of the path
    //     apigClient.uploadObjectPut({object: photoFile.name, 'x-amz-meta-customLabels': customLabels}, arrayBuffer, additionalParams)
    //         .then(function (response) {
    //             alert('Upload successful!');
    //         }).catch(function (error) {
    //             console.error('Upload failed:', error);
    //             alert('Upload failed. See console for details.');
    //         });
    // };
}