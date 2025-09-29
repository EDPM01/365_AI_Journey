### Project Structure

```
csv_cleaner/
│
├── data/
│   ├── productos.csv
│   └── proveedores.csv
│
├── scripts/
│   ├── clean_csv.py
│   └── detect_anomalies.py
│
├── requirements.txt
└── README.md
```

### Step 1: Create the Project Directory

Create a directory named `csv_cleaner` and navigate into it. Inside, create the subdirectories `data` and `scripts`.

### Step 2: Add CSV Files

Place your `productos.csv` and `proveedores.csv` files in the `data` directory.

### Step 3: Create the `requirements.txt` File

Create a `requirements.txt` file to manage dependencies. You might need libraries like `pandas` and `numpy` for data manipulation and anomaly detection.

```plaintext
pandas
numpy
```

### Step 4: Create the Cleaning Script

Create a file named `clean_csv.py` in the `scripts` directory. This script will handle the cleaning of the CSV files.

```python
# scripts/clean_csv.py

import pandas as pd

def clean_csv(file_path):
    # Load the CSV file
    df = pd.read_csv(file_path)

    # Display initial info
    print(f"Initial data shape: {df.shape}")
    print(df.info())

    # Drop rows with all NaN values
    df.dropna(how='all', inplace=True)

    # Drop duplicate rows
    df.drop_duplicates(inplace=True)

    # Fill NaN values with appropriate methods (mean, median, etc.)
    # Example: Fill NaN in 'precio_base' with the mean
    if 'precio_base' in df.columns:
        df['precio_base'].fillna(df['precio_base'].mean(), inplace=True)

    # Save the cleaned data
    cleaned_file_path = file_path.replace('.csv', '_cleaned.csv')
    df.to_csv(cleaned_file_path, index=False)
    print(f"Cleaned data saved to: {cleaned_file_path}")

if __name__ == "__main__":
    # Example usage
    clean_csv('../data/productos.csv')
    clean_csv('../data/proveedores.csv')
```

### Step 5: Create the Anomaly Detection Script

Create a file named `detect_anomalies.py` in the `scripts` directory. This script will detect anomalies in the cleaned data.

```python
# scripts/detect_anomalies.py

import pandas as pd
import numpy as np

def detect_anomalies(file_path):
    # Load the cleaned CSV file
    df = pd.read_csv(file_path)

    # Example: Detect anomalies in 'precio_base' using Z-score
    if 'precio_base' in df.columns:
        mean = df['precio_base'].mean()
        std_dev = df['precio_base'].std()
        threshold = 3  # Z-score threshold

        # Calculate Z-scores
        df['z_score'] = (df['precio_base'] - mean) / std_dev

        # Identify anomalies
        anomalies = df[np.abs(df['z_score']) > threshold]
        print(f"Anomalies detected: {anomalies.shape[0]}")

        # Save anomalies to a new CSV file
        anomalies_file_path = file_path.replace('.csv', '_anomalies.csv')
        anomalies.to_csv(anomalies_file_path, index=False)
        print(f"Anomalies saved to: {anomalies_file_path}")

if __name__ == "__main__":
    # Example usage
    detect_anomalies('../data/productos_cleaned.csv')
```

### Step 6: Create the README File

Create a `README.md` file to document your project.

```markdown
# CSV Cleaner and Anomaly Detector

This project includes scripts for cleaning CSV files and detecting anomalies in the data.

## Project Structure

- `data/`: Contains the original CSV files.
- `scripts/`: Contains the Python scripts for cleaning and anomaly detection.

## Requirements

To run this project, you need to install the required packages:

```bash
pip install -r requirements.txt
```

## Usage

1. Clean the CSV files:
   ```bash
   python scripts/clean_csv.py
   ```

2. Detect anomalies in the cleaned CSV files:
   ```bash
   python scripts/detect_anomalies.py
   ```
```

### Step 7: Run the Scripts

To run the scripts, navigate to the `scripts` directory in your terminal and execute:

```bash
python clean_csv.py
python detect_anomalies.py
```

### Conclusion

This project structure and code provide a solid foundation for cleaning CSV files and detecting anomalies. You can expand upon this by adding more sophisticated anomaly detection methods or additional data cleaning techniques as needed.