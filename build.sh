set -o errexit

# Upgrade pip and install compatible setuptools
pip install --upgrade pip
pip install "setuptools<60" wheel cython

# Install dependencies
pip install -r requirements.txt
