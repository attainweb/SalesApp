echo "Setting git commit template for the project"
git config commit.template .gitmessage
if [ $? -eq 0 ]
then
  echo "- Successfully set"
else
  echo "- Could not set git commit template" >&2
  exit 1
fi

