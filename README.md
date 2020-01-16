# Submission platform

## Installation Steps

safeexec added to path
iptables for gid
/sbin/iptables -A OUTPUT -m owner --gid-owner 2000 -j DROP

### Install NodeJs and pm2

```
sudo apt-get install curl software-properties-common
curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### Install Project dependencies

```
npm i
cp config/config.template.json config/config.json
nano config/config.json
```

### Install mongoDB

```
sudo apt install mongodb
```

### Install safeexec

```
git clone git@github.com:cemc/safeexec.git
apt install make
apt install gcc
cd safeexec
make
```

### Run server

prod
```
pm2 start index --name server
```

def
```
nodemon
```

## Warning

Update is not secure at all
Memory is bs
