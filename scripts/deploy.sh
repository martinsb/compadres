#!/bin/sh
SSH_LOGIN=ec2-user@ec2-13-50-19-174.eu-north-1.compute.amazonaws.com

if [[ -z "${COMPADRES_PEM_FILE}" ]]; then
    echo "Please set COMPADRES_PEM_FILE environment variable indicating path to the correct SSH PEM file"
    exit 1
fi

#scp -i "$COMPADRES_PEM_FILE" -r packages/compadres-server/build packages/compadres-server/ecosystem.config.js package.json yarn.lock $SSH_LOGIN:~/compadres
rsync --delete -azvv -e "ssh -i \"$COMPADRES_PEM_FILE\"" packages/compadres-server/build packages/compadres-server/ecosystem.config.js packages/compadres-server/package.json packages/compadres-server/yarn.lock $SSH_LOGIN:~/compadres
ssh -i "$COMPADRES_PEM_FILE" $SSH_LOGIN 'cd ~/compadres && yarn install && pm2 start --env production'
