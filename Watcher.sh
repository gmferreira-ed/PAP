#!/bin/bash

# Array with repo URLs
repos=("https://github.com/Exodation/PAP.git")

# Base directory where repos will be cloned
base_dir="/opt/Docker/"

# Function to check and update repos
check_and_update_repo() {
  repo_url=$1
  repo_name=$(basename $repo_url .git)
  repo_dir="$base_dir/$repo_name"

  # Check if the repo folder exists
  if [ -d "$repo_dir" ]; then
    echo "Repo $repo_name already exists. Checking for updates..."
    # Go to the repo directory
    cd $repo_dir

    # Fetch the latest changes from the remote
    git fetch

    # Check if there are changes in the remote repo (compare local and remote)
    if git diff --quiet HEAD..origin/main; then
      echo "No changes in $repo_name."
    else
      echo "Changes detected in $repo_name. Force pulling..."
      git reset --hard origin/main  # Force pull to reset any local changes
    fi
  else
    echo "Repo $repo_name not found. Cloning..."
    git clone $repo_url $repo_dir
  fi
}

# Loop through the list of repos and check/update them
for repo_url in "${repos[@]}"; do
  check_and_update_repo $repo_url
done
