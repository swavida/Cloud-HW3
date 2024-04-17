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
    console.log(photoFile.size);
    const customLabels = document.getElementById('customLabels').value;

    const config = {
        headers: {
            'Content-Type': 'image/jpg',
            'x-amz-meta-customLabels': customLabels,
            'x-api-key': 'heskfhI7P9ad9Ng2zdKsA7V8W3oajlKHaDZuazG9'
        }
    };
    const params = {
        'object': photoFile.name,
        'x-amz-meta-customLabels': customLabels,
    }

    const apigClient = apigClientFactory.newClient({
        apiKey: 'heskfhI7P9ad9Ng2zdKsA7V8W3oajlKHaDZuazG9'
    });
    // Assuming you have a File object `imageFile`
    var body = photoFile;
    apigClient.uploadObjectPut(params, body, config)
        .then(function(result) {
            alert('File uploaded successfully!');
        })
        .catch(function(error) {
            alert('Error uploading file:', error);
        });
}